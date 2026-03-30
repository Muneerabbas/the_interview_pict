import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

// Delete draft
export async function POST(req) {
  try {
    const db = await getMongoDb();
    const drafts = db.collection("drafts");
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
