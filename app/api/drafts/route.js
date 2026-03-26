import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Create a persistent MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("int-exp");
const drafts = db.collection("drafts");
const user = db.collection("user");

// Ensure MongoDB is connected
(async () => {
  await client.connect();
  console.log("Connected to MongoDB");
})();

// Save draft
export async function POST(req) {
  try {
    const {
      exp_text,
      company,
      branch,
      batch,
      profile_pic,
      name,
      role,
      email,
      chatAnswers,
      chatStage,
      chatMessages,
      totalRounds,
      currentRound
    } = await req.json();

    // Basic validation
    if (!email) {
      return NextResponse.json({ message: "User email is required" }, { status: 400 });
    }

    // // Validate user exists
    // const userDoc = await user.findOne({ email });
    // if (!userDoc) {
    //   return NextResponse.json({ message: "User not found" }, { status: 404 });
    // }

    const now = new Date().toISOString();

    // Create draft document
    const draftDoc = {
      exp_text: exp_text || '',
      company: company || '',
      branch: branch || '',
      batch: batch || '',
      profile_pic: profile_pic || '',
      name: name || '',
      role: role || '',
      email,
      chatAnswers: chatAnswers || null,
      chatStage: chatStage || 'eligibility',
      chatMessages: chatMessages || [],
      totalRounds: totalRounds || 0,
      currentRound: currentRound || 1,
      created_at: now,
      last_edited: now,
      status: 'draft'
    };

    // Upsert the draft - if exists update, if not create
    const result = await drafts.updateOne(
      { email },
      { $set: draftDoc },
      { upsert: true }
    );

    if (!result.acknowledged) {
      return NextResponse.json({ message: "Failed to save draft" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Draft saved successfully",
      email
    }, { status: 200 });

  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Get draft by email
export async function GET(req) {
  try {
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const draft = await drafts.findOne({ email });

    if (!draft) {
      return NextResponse.json({ message: "No draft found" }, { status: 404 });
    }

    return NextResponse.json(draft, { status: 200 });

  } catch (error) {
    console.error("Error retrieving draft:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}