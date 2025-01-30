import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export async function GET(req) {
  try {
    // Get the `page` parameter from query string and default to 0 if not provided
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0", 10);

    // Items per page
    const ITEMS_PER_PAGE = 10;

    // Connect to MongoDB
    await client.connect();
    // console.log("Connected to MongoDB");

    // Access the database and collection
    const db = client.db("int-exp");
    const experience = db.collection("experience");

    // Fetch the data
    const feed = await experience
      .find({})
      .toArray();

    // Sort by date after converting the string date to a JavaScript Date object
    const sortedFeed = feed
      .map(item => ({
        ...item,
        date: new Date(item.date)  // Convert the string to a Date object for sorting
      }))
      .sort((a, b) => b.date - a.date)  // Sort in descending order (most recent first)
      .slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);  // Apply pagination

    // Revert the date field to string format (if you want to keep the same format)
    const finalFeed = sortedFeed.map(item => ({
      ...item,
      date: item.date.toString()  // Convert the Date object back to string
    }));

    // console.log(finalFeed);

    // Return the feed as a JSON response
    return NextResponse.json(finalFeed);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
