import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

let client;
let db;

// Function to connect to MongoDB
async function connectDB() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db("int-exp"); // Replace with your actual database name
    }
    return db;
}

export async function GET() {
    try {
        const db = await connectDB();
        const collection = db.collection("experience"); // Replace with your actual collection name
        const count = await collection.countDocuments();

        return NextResponse.json({ count }, { status: 200 });
    } catch (error) {
        console.error("Error fetching post count:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}