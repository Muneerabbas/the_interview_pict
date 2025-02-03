import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Persistent MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("int-exp");
const drafts = db.collection("drafts");

// Ensure MongoDB is connected once
(async () => {
  await client.connect();
  console.log("Connected to MongoDB");
})();

// Delete draft
export async function POST(req) {
  try {
    // Parse the JSON request body properly
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Delete the draft associated with the provided email
    const result = await drafts.deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "No draft found to delete" }, { status: 404 });
    }

    return NextResponse.json({ message: "Draft deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
