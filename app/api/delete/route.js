import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Persistent MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
const database = client.db("int-exp");
const collection = database.collection("experience");

(async () => {
  await client.connect();
  console.log("Connected to MongoDB");
})();

// DELETE Handler
export async function DELETE(req) {
  try {
    if (!req.body) throw new Error("Request body is undefined");

    const body = await req.json().catch(() => {
      throw new Error("Invalid JSON in request body");
    });

    const { uid, email } = body;
    if (!uid || !email) throw new Error("Missing required fields: uid or email");

    const result = await collection.deleteOne({ uid, email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "No matching experience found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Experience deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
