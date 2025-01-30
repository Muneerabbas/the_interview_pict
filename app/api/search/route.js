import { NextResponse } from "next/server";

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
// Create a new MongoClient
const client = new MongoClient("mongodb+srv://himanshugholse08:wBX31Hgv3SxhAg9E@interview-experience.s8jve.mongodb.net/");


async function main(search_text) {
      
         await client.connect();
    console.log("Connected to MongoDB");

    // Access a database
    const db = client.db("int-exp");

    // Access a collection
    const experience = db.collection("experience");

    // Insert a single document

    const result =  await experience.find({ $text: { $search: search_text } }).limit(10).toArray();

    return result;
    
}




export async function GET(req) {
    try {
        const search = req.nextUrl.searchParams.get("search");
        
        const result = await main(search);

        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
