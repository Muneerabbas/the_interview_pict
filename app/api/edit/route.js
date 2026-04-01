import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getMongoDb } from "@/lib/mongodb";

async function invalidateAfterEdit(email) {
    if (!email || !redis) return;

    const keys = [
        `profile_posts_${encodeURIComponent(email)}`,
        `public_profile_full:${email}`,
        `user_profile_data:${email}`
    ];

    try {
        await redis.del(keys);
        console.log("[cache] Edit invalidation completed");
    } catch (err) {
        console.warn("[cache] Edit invalidation failed:", err?.message || err);
    }
}

export async function PUT(req) {
    const { uid, exp_text, company, college, branch, batch, role, email } = await req.json();

    try {
        const db = await getMongoDb();
        const experience = db.collection("experience");

        const result = await experience.updateOne(
            { uid, email },
            {
                $set: {
                    exp_text,
                    company,
                    college,
                    branch,
                    batch,
                    role,
                    updated_at: new Date().toString()
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "No matching experience found" }, { status: 404 });
        }

        await invalidateAfterEdit(email);

        return NextResponse.json({ message: "Experience updated successfully", uid }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
