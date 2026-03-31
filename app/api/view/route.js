import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import redis from "@/lib/redis";
import { incrementFeedVersion } from "@/lib/feedCache";

const client = new MongoClient(process.env.MONGODB_URI);

export async function POST(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: "Missing id" }, { status: 400 });
        }

        await client.connect();
        const db = client.db();
        const collection = db.collection("experience");

        // Atomic increment of views
        const result = await collection.updateOne(
            { uid: id },
            { $inc: { views: 1 } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        // Bump global version so trending feeds pick up the new view count
        if (redis) {
            try {
                await incrementFeedVersion(redis);
            } catch (err) {
                console.warn("[cache] view invalidation failed:", err?.message || err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("View increment error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
