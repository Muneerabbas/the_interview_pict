import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { jsonError } from "@/lib/api-response";

export async function GET() {
    try {
        const db = await getMongoDb({ mode: "read" });
        const collection = db.collection("experience"); // Replace with your actual collection name
        const count = await collection.countDocuments();

        return NextResponse.json({ count }, { status: 200 });
    } catch (error) {
        console.error("Error fetching post count:", error?.message || error);
        return jsonError(error, "Unable to load post count");
    }
}
