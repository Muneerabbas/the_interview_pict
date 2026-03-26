import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
    const itemsPerPage = parseInt(req.nextUrl.searchParams.get("itemsPerPage") || "10", 10);
    const sortType = req.nextUrl.searchParams.get("sort") || "latest";
    const companyFilter = req.nextUrl.searchParams.get("company");

    await client.connect();
    const db = client.db("int-exp");
    const experience = db.collection("experience");

    let pipeline = [];

    // Filter by Company
    if (companyFilter) {
      pipeline.push({ $match: { company: companyFilter } });
    }

    // Define Sort Logic
    if (sortType === "trending") {
      pipeline.push(
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ["$likes", []] } },
            viewsCount: { $convert: { input: { $ifNull: ["$views", 0] }, to: "int", onError: 0, onNull: 0 } },
          }
        },
        {
          $addFields: {
            trendingScore: {
              $add: [
                { $multiply: ["$likesCount", 3] }, // Likes have 3x weight
                "$viewsCount"
              ]
            }
          }
        },
        { $sort: { trendingScore: -1, date: -1 } }
      );
    } else {
      // Default: Latest
      pipeline.push({ $sort: { date: -1 } });
    }

    // Pagination
    pipeline.push({ $skip: page * itemsPerPage });
    pipeline.push({ $limit: itemsPerPage });

    pipeline.push(
      {
        $project: {
          trendingScore: 0 // Exclude internal score
        }
      }
    );

    const feed = await experience.aggregate(pipeline).toArray();

    // Map date to string for JSON safety
    const finalFeed = feed.map(item => ({
      ...item,
      date: item.date ? new Date(item.date).toString() : new Date().toString()
    }));

    return NextResponse.json(finalFeed);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}