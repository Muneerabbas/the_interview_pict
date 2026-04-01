import { NextResponse } from "next/server";
import { fetchWithCache } from "@/lib/cache";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const cacheKey = `profile_posts_${encodeURIComponent(email)}`;

    const posts = await fetchWithCache(cacheKey, 60, async () => {
      const db = await getMongoDb();
      const collection = db.collection("experience");
      return collection
        .find({ email })
        .sort({ date: -1 })
        .toArray();
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
