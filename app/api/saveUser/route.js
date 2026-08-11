import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getMongoDb } from "@/lib/mongodb";
import { jsonError } from "@/lib/api-response";

export async function POST(req) {
  try {
    const { gmail, name, image } = await req.json();

    if (!gmail || !name) {
      return NextResponse.json(
        { success: false, error: "Gmail and name are required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const db = await getMongoDb({ mode: "write" });
    const users = db.collection("user");

    // Check if user exists
    const existingUser = await users.findOne({ gmail });
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
    } else {
      // Insert new user
      result = await users.insertOne({
        gmail,
        name,
        image,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Invalidate cache
    if (redis) {
      await redis.del([
        `user_profile_data:${gmail}`,
        `public_profile_full_v2:${gmail}`
      ]);
    }

    return NextResponse.json({ success: true,
      message: "User saved successfully",
      operation: existingUser ? "updated" : "inserted",
      result
    }, {
      status: 200
    });

  } catch (error) {
    console.error("saveUser API error:", error?.message || error);
    return jsonError(error, "Failed to save user");
  }
}
