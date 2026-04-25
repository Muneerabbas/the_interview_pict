import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: "Missing id" }, { status: 400 });
        }

        const db = await getMongoDb();
        const experience = db.collection("experience");
        const tales = db.collection("tales");
        const viewLogs = db.collection("view_logs");

        // Atomic increment of views in either collection
        let result = await experience.updateOne(
            { uid: id },
            { $inc: { views: 1 } }
        );

        let collectionName = "experience";
        if (result.matchedCount === 0) {
            result = await tales.updateOne(
                { uid: id },
                { $inc: { views: 1 } }
            );
            collectionName = "tales";
        }

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        // Log the view event for "Trending this week" analytics
        await viewLogs.insertOne({
            postId: id,
            collection: collectionName,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("View increment error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
