import { NextResponse } from "next/server";
import {MongoClient} from "mongodb"

// Create a new MongoClient
const client = new MongoClient(process.env.MONGODB_URI);

export async function DELETE(req) {
    const { uid,email } = await req.json();  // Extract the ID from the request body

    try {
        //find Experience by uid check if token is correct and email is correct then delete the experience
        await client.connect();
        const database = client.db("int-exp");
        const collection = database.collection('experience');
        const result = await collection.deleteOne({ uid, email });

        return NextResponse.json({ message: "Experience deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
