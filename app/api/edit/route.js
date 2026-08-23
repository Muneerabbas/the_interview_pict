import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getMongoDb } from "@/lib/mongodb";
import { requireSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

async function invalidateAfterEdit(email) {
    if (!email || !redis) return;

    const keys = [
        `profile_posts_${encodeURIComponent(email)}`,
        `public_profile_full_v2:${email}`,
        `user_profile_data:${email}`
    ];

    try {
        await redis.del(keys);
    } catch (err) {
        console.warn("[cache] Edit invalidation failed:", err?.message || err);
    }
}

const EDITABLE_FIELDS = ["exp_text", "company", "college", "branch", "batch", "role", "title", "category", "tags"];

export async function PUT(req) {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    try {
        const body = await req.json().catch(() => ({}));
        const { uid } = body;

        if (!uid) {
            return NextResponse.json({ message: "Missing required field: uid" }, { status: 400 });
        }

        // Only set what the client actually sent. Spreading every destructured field
        // wrote `undefined` -> null and silently wiped company/college/branch/batch/role
        // on a partial edit.
        const $set = { updated_at: new Date().toString() };
        for (const field of EDITABLE_FIELDS) {
            if (body[field] !== undefined) $set[field] = body[field];
        }

        const db = await getMongoDb({ mode: "write" });
        const filter = { uid, email: auth.email };

        // Tales live in their own collection; editing a story used to always 404.
        let result = await db.collection("experience").updateOne(filter, { $set });

        if (result.matchedCount === 0) {
            result = await db.collection("tales").updateOne(filter, { $set });
        }

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "No matching experience found" }, { status: 404 });
        }

        await invalidateAfterEdit(auth.email);

        return NextResponse.json({ message: "Experience updated successfully", uid }, { status: 200 });
    } catch (error) {
        console.error("Error updating experience:", error);
        return jsonError(error, "Unable to update experience");
    }
}
