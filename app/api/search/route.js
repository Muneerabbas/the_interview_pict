import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Load MongoDB URI securely from environment variables
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

const client = new MongoClient(
  "mongodb+srv://himanshugholse08:wBX31Hgv3SxhAg9E@interview-experience.s8jve.mongodb.net/"
);


async function main(search_text) {
  await client.connect();
  console.log("Connected to MongoDB");

  const db = client.db("int-exp");
  const experience = db.collection("experience");

  // Atlas Search Query with Weights
  const result = await experience
    .aggregate([
      {
        $search: {
          index: "main", // Replace with your actual search index name
          compound: {
            should: [
              { text: { query: search_text, path: "company", score: { boost: { value: 5 } }, fuzzy: {} } },
              { text: { query: search_text, path: "role", score: { boost: { value: 6 } }, fuzzy: {} } },
              { text: { query: search_text, path: "name", score: { boost: { value: 20 } }, fuzzy: {} } },
              { text: { query: search_text, path: "exp_text", score: { boost: { value: 5 } }, fuzzy: {} } },
              { text: { query: search_text, path: "branch", score: { boost: { value: 3 } }, fuzzy: {} } },
              { text: { query: search_text, path: "batch", score: { boost: { value: 2 } }, fuzzy: {} } }
            ]
          }
        }
      },
      { $limit: 10 }
    ])
    .toArray();

  return result;
}

export async function GET(req) {
  try {
    const search = req.nextUrl.searchParams.get("search");

    if (!search) {
      return NextResponse.json({ message: "Search query is required" }, { status: 400 });
    }

    const result = await main(search);

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
