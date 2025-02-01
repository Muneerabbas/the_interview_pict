import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { nanoid } from "nanoid";
import slugify from "slugify";

// Create a persistent MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("int-exp");
const experience = db.collection("experience");
const user = db.collection("user");

// Ensure MongoDB is connected
(async () => {
  await client.connect();
  console.log("Connected to MongoDB");
})();

export async function POST(req) {
  try {
    const { exp_text, company, branch, batch, profile_pic, name, role,email} = await req.json();
    if (!exp_text || !company || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Validate token
    const userDoc = await user.findOne({ email });

    // Generate a meaningful UID: "google-sde-2025-nanoid"
    const baseSlug = slugify(`${name}'s experience at ${company} ${role} ${batch} `, { lower: true, strict: true });
    let uid = `${baseSlug}-${nanoid(6)}`; // Append a short unique ID

    // Ensure UID uniqueness in DB
    while (await experience.findOne({ uid })) {
      uid = `${baseSlug}-${nanoid(6)}`; // Regenerate if it already exists
    }

    // Save experience to DB
    const now = new Date().toISOString();
    const result = await experience.insertOne({
      uid, exp_text, company, branch, batch, profile_pic, name, date: now, views: 0, role,email
    });

    if (!result.acknowledged) {
      return NextResponse.json({ message: "Failed to save experience" }, { status: 500 });
    }

    return NextResponse.json({ message: "Experience saved successfully", uid }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
