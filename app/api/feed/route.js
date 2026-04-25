import { NextResponse } from "next/server";
import { resolveProfileName } from "@/lib/utils";
import { getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const FEED_SORT_TRENDING = "trending";

function normalizeFeedSort(sort) {
  return sort === "trending" ? FEED_SORT_TRENDING : "latest";
}

function buildPipeline({
  sort,
  page,
  itemsPerPage,
  companyFilter,
  collegeFilter,
  branchFilter,
  batchFilter,
  contentType,
}) {
  const pipeline = [];
  const match = { content_type: contentType || "interview" };
  if (companyFilter) match.company = companyFilter;
  if (collegeFilter) match.college = collegeFilter;
  if (branchFilter) match.branch = branchFilter;
  if (batchFilter) match.batch = batchFilter;

  // Real "Trending this week" logic
  if (sort === FEED_SORT_TRENDING) {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 14); // Extended to 14 days just in case low volume
    match.date = { $gte: lastWeek.toISOString() };
  }

  pipeline.push({ $match: match });

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
  return pipeline;
}

function processFeedResults(feed) {
  return feed.map((item) => {
    const authorImage = item.author?.image || item.author?.profile_pic || item.author?.profilePic;
    return {
      ...item,
      profile_pic: authorImage || item.profile_pic || null,
      name: resolveProfileName({ ...item, ...item.author }),
      date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
    };
  });
}

export async function GET(req) {
  try {
    const page = Number.parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
    const itemsPerPage = Number.parseInt(req.nextUrl.searchParams.get("itemsPerPage") || "10", 10);
    const companyFilter = req.nextUrl.searchParams.get("company");
    const collegeFilter = req.nextUrl.searchParams.get("college");
    const branchFilter = req.nextUrl.searchParams.get("branch");
    const batchFilter = req.nextUrl.searchParams.get("batch");
    const contentType = req.nextUrl.searchParams.get("contentType") || "interview";
    const sort = req.nextUrl.searchParams.get("sort") || "latest";

    const db = await getMongoDb();

    // Check which collection to hit: tales or experience
    const collectionName = contentType === "tale" ? "tales" : "experience";
    const collection = db.collection(collectionName);

    let feed = [];

    if (sort === "random") {
      feed = await collection.aggregate([
        { $match: { content_type: contentType } },
        { $sample: { size: itemsPerPage } },
        {
          $lookup: { from: "user", localField: "email", foreignField: "gmail", as: "author_info" },
        },
        { $addFields: { author: { $arrayElemAt: ["$author_info", 0] } } },
        { $project: { author_info: 0 } }
      ]).toArray();
    } else {
      const pipeline = buildPipeline({ sort, page, itemsPerPage, companyFilter, collegeFilter, branchFilter, batchFilter, contentType });

      // If trending but no results, fallback to all-time views
      const matchStage = pipeline.find(s => s.$match);
      if (sort === "trending" && matchStage && matchStage.$match.date) {
        delete matchStage.$match.date;
      }

      feed = await collection.aggregate(pipeline).toArray();
    }

    const data = processFeedResults(feed);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
