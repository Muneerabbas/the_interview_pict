import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import redis from "@/lib/redis";

const client = new MongoClient(process.env.MONGODB_URI);

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Missing email" }, { status: 400 });
        }

        await client.connect();
        const db = client.db("int-exp");
        const collection = db.collection("user");

        const result = await collection.updateOne(
            { gmail: email },
            { $inc: { views: 1 } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Invalidate cache
        if (redis) {
            await redis.del([
                `user_profile_data:${email}`,
                `public_profile_full:${email}`
            ]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile view increment error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
