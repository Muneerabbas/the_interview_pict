import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { jsonError } from "@/lib/api-response";

export async function GET() {
    try {
        const db = await getMongoDb({ mode: "read" });

        // Tales live in their own collection, so the site-wide "posts" number
        // silently excluded every story.
        const [interviews, tales] = await Promise.all([
            db.collection("experience").countDocuments(),
            db.collection("tales").countDocuments(),
        ]);

        return NextResponse.json({ count: interviews + tales }, { status: 200 });
    } catch (error) {
        console.error("Error fetching post count:", error?.message || error);
        return jsonError(error, "Unable to load post count");
    }
}
