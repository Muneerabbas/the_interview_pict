import { NextResponse } from "next/server";
import { fetchWithCache } from "@/lib/cache";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const page = Number.parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
    const itemsPerPage = Number.parseInt(req.nextUrl.searchParams.get("itemsPerPage") || "30", 10);

    const cacheKey = `top_stories_page_${page}`;

    const data = await fetchWithCache(cacheKey, 900, async () => {
      const db = await getMongoDb();
      const experience = db.collection("experience");

      const pipeline = [
        {
          $addFields: {
            viewsInt: {
              $convert: {
                input: { $ifNull: ["$views", 0] },
                to: "int",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
        { $sort: { viewsInt: -1, date: -1, _id: -1 } },
        { $skip: page * itemsPerPage },
        { $limit: itemsPerPage },
        { $project: { viewsInt: 0 } },
      ];

      return experience.aggregate(pipeline).toArray();
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching top stories:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
