import { NextResponse } from "next/server";
import { fetchWithCache } from "@/lib/cache";
import { getMongoDb } from "@/lib/mongodb";
import { requireSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";
import { TALES_ENABLED } from "@/lib/feature-flags";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";

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
      // Primary, not the secondaryPreferred read pool: this runs right after the
      // caller published or deleted something, and a 90s-stale replica would hand
      // back a snapshot without their new post -- which then gets cached for 60s.
      const db = await getMongoDb({ mode: "write" });

      // The $lookup into `user` is what makes the author's live Google photo and
      // current display name show up on their own cards (eb69968); the raw post
      // fields go stale as soon as the user changes either.
      const withAuthor = [
        { $sort: { date: -1, _id: -1 } },
        {
          $lookup: {
            from: "user",
            localField: "email",
            foreignField: "gmail",
            as: "author_info",
          },
        },
        { $addFields: { author: { $arrayElemAt: ["$author_info", 0] } } },
        { $project: { author_info: 0 } },
        { $limit: 200 },
      ];

      const [interviews, tales] = await Promise.all([
        db.collection("experience").aggregate([{ $match: { email } }, ...withAuthor]).toArray(),
        // Tales are hidden, and their /single pages 404 -- do not list posts the
        // user cannot open.
        TALES_ENABLED
          ? db.collection("tales").aggregate([{ $match: { email } }, ...withAuthor]).toArray()
          : [],
      ]);

      return [...interviews, ...tales]
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .map(({ author, ...post }) => ({
          ...post,
          _id: String(post._id),
          profile_pic: resolveProfileImage({ ...post, author }),
          name: resolveProfileName({ ...post, author }),
        }));
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("Error loading profile posts:", error);
    return jsonError(error, "Unable to load posts");
  }
}
