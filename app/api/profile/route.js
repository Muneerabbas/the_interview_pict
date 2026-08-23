import { NextResponse } from "next/server";
import { fetchWithCache } from "@/lib/cache";
import { getMongoDb } from "@/lib/mongodb";
import { requireSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// The caller's own posts. This used to dump every raw post document for any
// email supplied in the body, with no authentication at all.
export async function POST() {
  const auth = await requireSession();
  if (auth.response) return auth.response;

  try {
    const email = auth.email;
    const cacheKey = `profile_posts_${encodeURIComponent(email)}`;

    const posts = await fetchWithCache(cacheKey, 60, async () => {
      const db = await getMongoDb({ mode: "read" });

      const [interviews, tales] = await Promise.all([
        db.collection("experience").find({ email }).limit(200).toArray(),
        db.collection("tales").find({ email }).limit(200).toArray(),
      ]);

      return [...interviews, ...tales]
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .map((post) => ({ ...post, _id: String(post._id) }));
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("Error loading profile posts:", error);
    return jsonError(error, "Unable to load posts");
  }
}
