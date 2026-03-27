import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { resolveProfileImage, resolveProfileName } from "../../../lib/utils";

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

    // Join with user collection to get latest profile data
    pipeline.push(
      {
        $lookup: {
          from: "user",
          localField: "email",
          foreignField: "gmail",
          as: "author_info"
        }
      },
      {
        $addFields: {
          author: { $arrayElemAt: ["$author_info", 0] }
        }
      },
      {
        $project: {
          trendingScore: 0,
          author_info: 0
        }
      }
    );

    const feed = await experience.aggregate(pipeline).toArray();

    // Map for high-fidelity resolution and JSON safety
    const finalFeed = feed.map(item => ({
      ...item,
      profile_pic: resolveProfileImage({ ...item, ...item.author }),
      name: resolveProfileName({ ...item, ...item.author }),
      date: item.date ? new Date(item.date).toString() : new Date().toString()
    }));

    return NextResponse.json(finalFeed);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}