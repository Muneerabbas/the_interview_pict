import { NextResponse } from "next/server";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";
import { fetchWithCache } from "@/lib/cache";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const page = Number.parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
    const itemsPerPage = Number.parseInt(req.nextUrl.searchParams.get("itemsPerPage") || "10", 10);
    const companyFilter = req.nextUrl.searchParams.get("company");

    const cacheKeyBase = `feed_page_${page}_limit_${itemsPerPage}`;
    const cacheKey = companyFilter
      ? `${cacheKeyBase}_company_${encodeURIComponent(companyFilter)}`
      : cacheKeyBase;

    const data = await fetchWithCache(cacheKey, 60, async () => {
      const db = await getMongoDb();
      const experience = db.collection("experience");

      const pipeline = [];

      if (companyFilter) {
        pipeline.push({ $match: { company: companyFilter } });
      }

      pipeline.push(
        { $sort: { date: -1 } },
        { $skip: page * itemsPerPage },
        { $limit: itemsPerPage },
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
        }
      );

      const feed = await experience.aggregate(pipeline).toArray();

      return feed.map((item) => ({
        ...item,
        profile_pic: resolveProfileImage({ ...item, ...item.author }),
        name: resolveProfileName({ ...item, ...item.author }),
        date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      }));
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
