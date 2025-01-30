import { NextResponse } from "next/server";

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
// Create a new MongoClient
const client = new MongoClient(process.env.MONGODB_URI);



export async function POST(req) {
    const { gmail, name,profilePic_Url,token } = await req.json();
    try {    
         await client.connect();
    console.log("Connected to MongoDB");

    // Access a database
    const db = client.db("int-exp");

    // Access a collection
        const users = db.collection("user");
        
        //check user if exists
        const existingUser = await users.findOne({ gmail });

        if (existingUser) {
            const updateUser = await users.updateOne(
                { gmail },
                { $set: { name,profilePic_Url,token } }
            )
        }
        else{
        await users.insertOne({ gmail, name,profilePic_Url,token });
        }

        return NextResponse.json({ message: "User saved successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
