import { NextResponse } from "next/server";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";
import { fetchWithCache } from "@/lib/cache";
import { buildFeedCacheKey, FEED_SORT_TRENDING, normalizeFeedSort } from "@/lib/feedCache";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const page = Number.parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
    const itemsPerPage = Number.parseInt(req.nextUrl.searchParams.get("itemsPerPage") || "10", 10);
    const companyFilter = req.nextUrl.searchParams.get("company");
    const collegeFilter = req.nextUrl.searchParams.get("college");
    const branchFilter = req.nextUrl.searchParams.get("branch");
    const batchFilter = req.nextUrl.searchParams.get("batch");
    const sort = normalizeFeedSort(req.nextUrl.searchParams.get("sort"));

    const cacheKey = buildFeedCacheKey({
      page,
      itemsPerPage,
      sort,
      company: companyFilter,
      college: collegeFilter,
      branch: branchFilter,
      batch: batchFilter,
    });

    const data = await fetchWithCache(cacheKey, 60, async () => {
      const db = await getMongoDb();
      const experience = db.collection("experience");

      const pipeline = [];

      const match = {};
      if (companyFilter) match.company = companyFilter;
      if (collegeFilter) match.college = collegeFilter;
      if (branchFilter) match.branch = branchFilter;
      if (batchFilter) match.batch = batchFilter;

      if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
      }

      pipeline.push(
        {
          $sort:
            sort === FEED_SORT_TRENDING
              ? { views: -1, date: -1, _id: -1 }
              : { date: -1, _id: -1 },
        },
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
