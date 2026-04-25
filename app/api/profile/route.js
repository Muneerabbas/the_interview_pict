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
      const experienceCol = db.collection("experience");
      const talesCol = db.collection("tales");

      const [interviews, tales] = await Promise.all([
        experienceCol.find({ email }).toArray(),
        talesCol.find({ email }).toArray()
      ]);

      // Combine and sort by date descending
      const allPosts = [...interviews, ...tales].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
      });

      return allPosts;
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
