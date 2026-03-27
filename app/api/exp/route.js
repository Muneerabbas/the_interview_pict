import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { resolveProfileImage, resolveProfileName } from "../../../lib/utils";

// Create a persistent MongoDB client
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("int-exp");
const collection = db.collection("experience");

// Ensure MongoDB is connected
(async () => {
  await client.connect();
  console.log("Connected to MongoDB");
})();

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const uid = req.nextUrl.searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ message: "Missing `uid` query parameter" }, { status: 400 });
    }

    const pipeline = [
      { $match: { uid } },
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
          author_info: 0
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();
    const data = results[0];

    if (!data) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    // Merge author info into the top level for helpers to pick it up
    const finalData = {
      ...data,
      profile_pic: resolveProfileImage({ ...data, ...data.author }),
      name: resolveProfileName({ ...data, ...data.author }),
    };

    return NextResponse.json(finalData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
