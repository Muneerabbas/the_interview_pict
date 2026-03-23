import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export const dynamic = "force-dynamic";
export async function GET(req) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0", 10);
    const itemsPerPage = parseInt(req.nextUrl.searchParams.get("itemsPerPage") || "10", 10); // Get itemsPerPage from query, default to 10

    await client.connect();
    const db = client.db("int-exp");
    const experience = db.collection("experience");

    const feed = await experience.find({}).toArray();

    const sortedFeed = feed
      .map(item => ({
        ...item,
        date: new Date(item.date)
      }))
      .sort((a, b) => b.date - a.date)
      .slice(page * itemsPerPage, (page + 1) * itemsPerPage); // Use itemsPerPage here

    const finalFeed = sortedFeed.map(item => ({
      ...item,
      date: item.date.toString()
    }));

    return NextResponse.json(finalFeed);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}