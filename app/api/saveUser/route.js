import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import redis from "@/lib/redis";

// Create the client outside the handler
const uri = process.env.MONGODB_URI;
let client = null;
let clientPromise = null;

// Initialize the client connection
const getClient = async () => {
  if (!client) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
};

export async function POST(req) {
  console.log("📥 Received request to save user");

  try {
    // Parse request body
    const { gmail, name, image } = await req.json();
    console.log("📝 User data received:", { gmail, name, image });

    if (!gmail || !name) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { message: "Gmail and name are required" },
        { status: 400 }
      );
    }

    // Get MongoDB client
    const client = await getClient();
    console.log("🔌 Connected to MongoDB");

    const db = client.db();
    const users = db.collection("user");

    // Check if user exists
    const existingUser = await users.findOne({ gmail });
    console.log("🔍 Existing user check:", existingUser ? "Found" : "Not found");

    let result;
    if (existingUser) {
      // Update existing user
      result = await users.updateOne(
        { gmail },
        {
          $set: {
            name,
            image,
            updatedAt: new Date()
          }
        }
      );
      console.log("✏️ User updated:", result);
    } else {
      // Insert new user
      result = await users.insertOne({
        gmail,
        name,
        image,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("➕ New user inserted:", result);
    }

    console.log("✅ Operation completed successfully");

    // Invalidate cache
    if (redis) {
      await redis.del([
        `user_profile_data:${gmail}`,
        `public_profile_full:${gmail}`
      ]);
    }

    return NextResponse.json({
      message: "User saved successfully",
      operation: existingUser ? "updated" : "inserted",
      result
    }, {
      status: 200
    });

  } catch (error) {
    console.error("❌ Error in saveUser API:", error);
    return NextResponse.json({
      message: "Failed to save user",
      error: error.message
    }, {
      status: 500
    });
  }
}