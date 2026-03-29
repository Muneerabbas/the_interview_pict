import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import redis from "@/lib/redis";
import { getDefaultFeedInvalidationKeys } from "@/lib/feedCache";

// Persistent MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
const database = client.db("int-exp");
const collection = database.collection("experience");


const cacheInvalidationKeys = getDefaultFeedInvalidationKeys();

function invalidateAfterDelete(email) {
  const keys = [...cacheInvalidationKeys];
  if (email) {
    keys.push(`profile_posts_${encodeURIComponent(email)}`);
    keys.push(`public_profile_full:${email}`);
    keys.push(`user_profile_data:${email}`);
  }

  if (!redis) return;

  // @upstash/redis del() can take multiple keys or an array
  redis.del(keys).catch((err) => {
    console.warn("[cache] invalidate failed:", err?.message || err);
  });
}

// Connect to MongoDB
(async () => {
  await client.connect();
  console.log("Connected to MongoDB");
})();

// DELETE Handler
export async function DELETE(req) {
  try {
    // Ensure req.body is available
    if (!req.body) {
      const body = await req.json(); // Attempt to parse the body
      if (!body) throw new Error("Request body is undefined or invalid");
    }

    // Parse and extract data from the body
    const body = await req.json();
    const { uid, email } = body;

    // Ensure required fields are present
    if (!uid || !email) throw new Error("Missing required fields: uid or email");

    // Perform the deletion
    const result = await collection.deleteOne({ uid, email });

    // Handle if no matching document is found
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "No matching experience found" }, { status: 404 });
    }

    invalidateAfterDelete(email);

    return NextResponse.json({ message: "Experience deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
