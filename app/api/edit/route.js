import { NextResponse } from "next/server";
import redis from "@/lib/redis";

const { MongoClient, ObjectId } = require('mongodb');

// Create a new MongoClient
const client = new MongoClient(process.env.MONGODB_URI);

const cacheInvalidationKeys = [
    "feed_page_0_limit_10",
    "top_stories_page_0",
];

function invalidateAfterEdit(email) {
    const keys = [...cacheInvalidationKeys];
    if (email) keys.push(`profile_posts_${encodeURIComponent(email)}`);

    if (!redis) return;
    if (redis.status === "wait") {
        redis.connect().catch(() => {});
    }

    redis.del(...keys).catch((err) => {
        console.warn("[cache] invalidate failed:", err?.message || err);
    });
}

export async function PUT(req) {
    const { uid, exp_text, company, branch, batch, role,email} = await req.json();

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        // Access a database
        const db = client.db("int-exp");

        // Access a collection
        const experience = db.collection("experience");   

        // Find the document with the provided id and update it
        const result = await experience.updateOne(
            { uid,email }, // Use ObjectId for MongoDB IDs
            { 
                $set: {
                    exp_text, 
                    company, 
                    branch, 
                    batch, 
                    role, 
                    updated_at: new Date().toString() // Optional: to track when the record was updated
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "No matching experience found" }, { status: 404 });
        }

        invalidateAfterEdit(email);

        console.log(result);

        return NextResponse.json({ message: "Experience updated successfully" ,uid}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
