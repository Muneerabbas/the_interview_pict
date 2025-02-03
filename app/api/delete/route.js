import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export async function DELETE(req) {
    try {
        if (!req) throw new Error("Request object is undefined");

        const body = await req.json().catch(() => {
            throw new Error("Invalid JSON in request body");
        });

        const { uid, email } = body;
        if (!uid || !email) throw new Error("Missing required fields: uid or email");

        await client.connect();
        const database = client.db("int-exp");
        const collection = database.collection("experience");
        const result = await collection.deleteOne({ uid, email });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "No matching experience found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Experience deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    } finally {
        await client.close();
    }
}
