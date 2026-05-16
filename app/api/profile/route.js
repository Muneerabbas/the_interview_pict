import { NextResponse } from "next/server";
import { fetchWithCache } from "@/lib/cache";
import { getMongoDb } from "@/lib/mongodb";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";

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
      const pipeline = [
        { $match: { email } },
        { $sort: { date: -1, _id: -1 } },
        {
          $lookup: {
            from: "user",
            localField: "email",
            foreignField: "gmail",
            as: "author_info",
          },
        },
        {
          $addFields: {
            author: { $arrayElemAt: ["$author_info", 0] },
          },
        },
        {
          $project: {
            author_info: 0,
          },
        },
      ];

      const rawPosts = await collection.aggregate(pipeline).toArray();
      return rawPosts.map((item) => ({
        ...item,
        profile_pic: resolveProfileImage(item),
        name: resolveProfileName(item),
      }));
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
