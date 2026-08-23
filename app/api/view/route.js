import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getMongoDb } from "@/lib/mongodb";
import redis from "@/lib/redis";
import { jsonError } from "@/lib/api-response";

const DEDUPE_WINDOW_SECONDS = 6 * 60 * 60;

/** One view per viewer per post per window; without this a loop inflated any counter. */
async function alreadyCounted(req, id) {
    if (!redis) return false;

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    try {
        const fresh = await redis.set(`view:${id}:${ip}`, 1, { nx: true, ex: DEDUPE_WINDOW_SECONDS });
        return !fresh;
    } catch (err) {
        console.warn("[view] dedupe fail-open:", err?.message || err);
        return false;
    }
}

export async function POST(req) {
    const limited = await checkRateLimit(req, { key: "post-view", limit: 120, windowSeconds: 300 });
    if (limited) return limited;

    try {
        const { id } = await req.json().catch(() => ({}));

        // See /api/like: a non-string id turned {uid: id} into an operator filter
        // and also collapsed the Redis dedupe key to "view:[object Object]:<ip>".
        if (typeof id !== "string" || !id.trim()) {
            return NextResponse.json({ message: "Missing id" }, { status: 400 });
        }

        if (await alreadyCounted(req, id)) {
            return NextResponse.json({ success: true, counted: false });
        }

        const db = await getMongoDb({ mode: "write" });

        let collectionName = "experience";
        let result = await db.collection("experience").updateOne({ uid: id }, { $inc: { views: 1 } });

        if (result.matchedCount === 0) {
            result = await db.collection("tales").updateOne({ uid: id }, { $inc: { views: 1 } });
            collectionName = "tales";
        }

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        // Analytics only; must never fail the request.
        db.collection("view_logs")
            .insertOne({ postId: id, collection: collectionName, timestamp: new Date() })
            .catch((err) => console.warn("[view_logs] insert failed:", err?.message || err));

        return NextResponse.json({ success: true, counted: true });
    } catch (error) {
        console.error("View increment error:", error);
        return jsonError(error, "Unable to record view");
    }
}
