import { NextResponse } from "next/server";
const { MongoClient } = require('mongodb');

// Create a new MongoClient
const client = new MongoClient(process.env.MONGODB_URI);

export async function DELETE(req) {
    const { uid,token,email } = await req.json();  // Extract the ID from the request body

    try {
        //find Experience by uid check if token is correct and email is correct then delete the experience
        await client.connect();
        const database = client.db(process.env.MONGODB_DATABASE);
        const user = await database.collection('user').findOne({ email });
        if (user.token !== token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
            
        }
        const collection = database.collection('experience');
        const result = await collection.deleteOne({ uid, email });

        return NextResponse.json({ message: "Experience deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
