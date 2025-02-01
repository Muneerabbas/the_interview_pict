import { NextResponse } from "next/server";
const { MongoClient } = require('mongodb');

// Create a new MongoClient
const client = new MongoClient(process.env.MONGODB_URI);

export async function POST(req) {
     // Extract the ID from the request body

    try {
        const {email} = await req.json(); 
        //find Experience by uid check if token is correct and email is correct then delete the experience
        await client.connect();
        const database = client.db("int-exp");
        const collection = database.collection('experience');
        const posts = (await collection.find({ email:email }).toArray()).reverse();
        
        return NextResponse.json({ posts }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
