import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: "Missing id" }, { status: 400 });
        }

        const db = await getMongoDb();
        const collection = db.collection("experience");

        // Atomic increment of views
        const result = await collection.updateOne(
            { uid: id },
            { $inc: { views: 1 } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("View increment error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
