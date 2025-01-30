import { NextResponse } from "next/server";

const { MongoClient, ObjectId } = require('mongodb');

// Create a new MongoClient
const client = new MongoClient(process.env.MONGODB_URI);

export async function PUT(req) {
    const { id, exp_text, company, branch, batch, role,email } = await req.json();

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        // Access a database
        const db = client.db("int-exp");

        // Access a collection
        const experience = db.collection("experience");

        const post=experience.find({uid})

        if (!email==post.email)
        {
            return NextResponse.json({ message: "Not your post!" }, { status: 401 })
        }



        // Find the document with the provided id and update it
        const result = await experience.updateOne(
            { _id: new MongoClient.ObjectId(id) }, // Use ObjectId for MongoDB IDs
            { 
                $set: {
                    exp_text, 
                    company, 
                    branch, 
                    batch, 
                    role, 
                    updated_at: new Date().toString() // Optional: to track when the record was updated
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "No matching experience found" }, { status: 404 });
        }

        console.log(result);

        return NextResponse.json({ message: "Experience updated successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
