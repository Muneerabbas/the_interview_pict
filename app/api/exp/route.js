import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

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
    // Get `uid` from query parameters
    const uid = req.nextUrl.searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ message: "Missing `uid` query parameter" }, { status: 400 });
    }

    // Fetch document & increment views in one atomic operation
    const data = await collection.findOneAndUpdate(
      { uid },
      { $inc: { views: 1 } }, // Increment views
      { returnDocument: "after" } // Return updated document
    );

    if (!data) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
