import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { getMongoDb } from "@/lib/mongodb";
import { requireSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

async function invalidateAfterDelete(email) {
  if (!email || !redis) return;

  const keys = [
    `profile_posts_${encodeURIComponent(email)}`,
    `public_profile_full_v2:${email}`,
    `user_profile_data:${email}`,
  ];

  try {
    await redis.del(keys);
  } catch (err) {
    console.warn("[cache] Delete invalidation failed:", err?.message || err);
  }
}

// DELETE Handler
export async function DELETE(req) {
  // The author is the session, never the body: `email` and `uid` are both public
  // via /api/feed, so trusting the body let anyone delete anyone's post.
  const auth = await requireSession();
  if (auth.response) return auth.response;

  try {
    const { uid } = await req.json().catch(() => ({}));

    if (!uid) {
      return NextResponse.json({ message: "Missing required field: uid" }, { status: 400 });
    }

    const db = await getMongoDb({ mode: "write" });
    const filter = { uid, email: auth.email };

    let result = await db.collection("experience").deleteOne(filter);

    if (result.deletedCount === 0) {
      result = await db.collection("tales").deleteOne(filter);
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "No matching experience found" }, { status: 404 });
    }

    await invalidateAfterDelete(auth.email);

    return NextResponse.json({ message: "Experience deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return jsonError(error, "Unable to delete experience");
  }
}
