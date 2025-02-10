import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export async function GET(req) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
    const ITEMS_PER_PAGE = 30; // Changed to 3 items per page

    await client.connect();
    const db = client.db("int-exp");
    const experience = db.collection("experience");

    const feed = await experience.find({}).toArray();

    const sortedFeed = feed
      .sort((a, b) => b.views - a.views) // Sorted by views in descending order
      .slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const finalFeed = sortedFeed; // No need to change date to string as we are not sorting by date anymore

    return NextResponse.json(finalFeed);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
