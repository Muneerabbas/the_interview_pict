import { NextResponse } from "next/server";
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

export async function POST(req) {
    try {
        const { email } = await req.json();

        // Check if the email is a Gmail address
        if (!email.endsWith("@gmail.com")) {
            return NextResponse.json({ message: "Only Gmail addresses are allowed" }, { status: 400 });
        }

        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db();
        const newsletters = db.collection("newsletter");

        // Check if the email already exists
        const existingEmail = await newsletters.findOne({ email });

        if (!existingEmail) {
            await newsletters.insertOne({ email });
        }

        return NextResponse.json({ message: "Email saved successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
