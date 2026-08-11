import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getMongoDb } from "@/lib/mongodb";
import { jsonError } from "@/lib/api-response";

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, error: "Missing email", code: "VALIDATION_ERROR" }, { status: 400 });
        }

        const db = await getMongoDb({ mode: "write" });
        const collection = db.collection("user");

        const result = await collection.updateOne(
            { gmail: email },
            { $inc: { views: 1 } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, error: "User not found", code: "NOT_FOUND" }, { status: 404 });
        }

        // Invalidate cache
        if (redis) {
            await redis.del([
                `user_profile_data:${email}`,
                `public_profile_full_v2:${email}`
            ]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile view increment error:", error);
        return jsonError(error, "Unable to update profile view");
    }
}
