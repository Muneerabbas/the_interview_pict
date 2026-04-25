import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getMongoDb } from "@/lib/mongodb";

async function invalidateAfterDelete(email) {
  if (!email || !redis) return;

  const keys = [
    `profile_posts_${encodeURIComponent(email)}`,
    `public_profile_full:${email}`,
    `user_profile_data:${email}`
  ];

  try {
    await redis.del(keys);
    console.log("[cache] Delete invalidation completed");
  } catch (err) {
    console.warn("[cache] Delete invalidation failed:", err?.message || err);
  }
}

// DELETE Handler
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { uid, email } = body;

    if (!uid || !email) {
      return NextResponse.json({ message: "Missing required fields: uid or email" }, { status: 400 });
    }

    const db = await getMongoDb();
    const experience = db.collection("experience");
    const tales = db.collection("tales");

    let result = await experience.deleteOne({ uid, email });

    if (result.deletedCount === 0) {
      result = await tales.deleteOne({ uid, email });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "No matching experience found" }, { status: 404 });
    }

    await invalidateAfterDelete(email);

    return NextResponse.json({ message: "Experience deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
