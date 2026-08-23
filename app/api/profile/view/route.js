import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import redis from "@/lib/redis";
import { getMongoDb } from "@/lib/mongodb";
import { normalizeEmail } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

const DEDUPE_WINDOW_SECONDS = 6 * 60 * 60;

async function alreadyCounted(req, email) {
    if (!redis) return false;

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    try {
        const fresh = await redis.set(`pview:${email}:${ip}`, 1, { nx: true, ex: DEDUPE_WINDOW_SECONDS });
        return !fresh;
    } catch (err) {
        console.warn("[profile-view] dedupe fail-open:", err?.message || err);
        return false;
    }
}

// This is the single place profile views are counted. The public profile page
// used to also $inc inside its cached fetcher, so counts were both double
// counted here and skipped on cache hits there.
export async function POST(req) {
    const limited = await checkRateLimit(req, { key: "profile-view", limit: 60, windowSeconds: 300 });
    if (limited) return limited;

    try {
        const email = normalizeEmail((await req.json().catch(() => ({}))).email);

        if (!email) {
            return NextResponse.json({ success: false, error: "Missing email", code: "VALIDATION_ERROR" }, { status: 400 });
        }

        if (await alreadyCounted(req, email)) {
            return NextResponse.json({ success: true, counted: false });
        }

        const db = await getMongoDb({ mode: "write" });
        const result = await db.collection("user").updateOne({ gmail: email }, { $inc: { views: 1 } });

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: "User not found", code: "NOT_FOUND" }, { status: 404 });
        }

        if (redis) {
            try {
                await redis.del([`user_profile_data:${email}`, `public_profile_full_v2:${email}`]);
            } catch (err) {
                console.warn("[cache] profile view invalidation failed:", err?.message || err);
            }
        }

        return NextResponse.json({ success: true, counted: true });
    } catch (error) {
        console.error("Profile view increment error:", error);
        return jsonError(error, "Unable to update profile view");
    }
}
