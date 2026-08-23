import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getMongoDb } from "@/lib/mongodb";
import { requireSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

export async function POST(req) {
  // Identity comes from the Google session; a body-supplied gmail let anyone
  // rename any account or swap its avatar.
  const auth = await requireSession();
  if (auth.response) return auth.response;

  try {
    const gmail = auth.email;
    const name = auth.name || gmail.split("@")[0];
    const image = auth.image || "";

    const db = await getMongoDb({ mode: "write" });

    // Single upsert: findOne-then-insert raced two concurrent first logins into
    // duplicate user documents (or a raw E11000 surfaced as a 500).
    const result = await db.collection("user").updateOne(
      { gmail },
      {
        $set: { name, image, updatedAt: new Date() },
        $setOnInsert: { gmail, createdAt: new Date() },
      },
      { upsert: true }
    );

    if (redis) {
      try {
        await redis.del([`user_profile_data:${gmail}`, `public_profile_full_v2:${gmail}`]);
      } catch (err) {
        console.warn("[cache] saveUser invalidation failed:", err?.message || err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "User saved successfully",
      operation: result.upsertedCount ? "inserted" : "updated",
    });
  } catch (error) {
    console.error("saveUser API error:", error?.message || error);
    return jsonError(error, "Failed to save user");
  }
}
