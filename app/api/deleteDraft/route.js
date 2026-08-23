import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { requireSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

// Delete the caller's own draft
export async function POST(req) {
  const auth = await requireSession();
  if (auth.response) return auth.response;

  try {
    const db = await getMongoDb({ mode: "write" });
    const drafts = db.collection("drafts");
    const { contentType } = await req.json().catch(() => ({}));

    // Drafts are upserted per {email, content_type}; filtering on email alone
    // deleted whichever of the two happened to match first.
    const result = await drafts.deleteOne({
      email: auth.email,
      content_type: contentType === "tale" ? "tale" : "interview",
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "No draft found to delete" }, { status: 404 });
    }

    return NextResponse.json({ message: "Draft deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return jsonError(error, "Unable to delete draft");
  }
}
