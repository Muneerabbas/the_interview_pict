import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getMongoDb } from "@/lib/mongodb";
import { requireSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

// Save draft
export async function POST(req) {
  const auth = await requireSession();
  if (auth.response) return auth.response;

  const limited = await checkRateLimit(req, { key: "draft-save", limit: 120, windowSeconds: 300 });
  if (limited) return limited;

  try {
    const db = await getMongoDb({ mode: "write" });
    const drafts = db.collection("drafts");
    // Every sibling route guards this; here a malformed body threw a 500.
    const body = await req.json().catch(() => ({}));
    const {
      exp_text,
      college,
      company,
      branch,
      batch,
      profile_pic,
      name,
      role,
      chatAnswers,
      chatStage,
      chatMessages,
      totalRounds,
      currentRound,
      content_type,
      tags
    } = body;

    // The draft always belongs to the caller; a body-supplied email let anyone
    // overwrite someone else's unpublished draft.
    const email = auth.email;

    const now = new Date().toISOString();

    // Create draft document
    const draftDoc = {
      exp_text: exp_text || '',
      college: college || '',
      company: company || '',
      branch: branch || '',
      batch: batch || '',
      profile_pic: profile_pic || '',
      name: name || '',
      role: role || '',
      tags: Array.isArray(tags)
        ? [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 6)
        : [],
      email,
      chatAnswers: chatAnswers || null,
      chatStage: chatStage || 'eligibility',
      chatMessages: chatMessages || [],
      totalRounds: totalRounds || 0,
      currentRound: currentRound || 1,
      created_at: now,
      last_edited: now,
      status: 'draft',
      content_type: content_type || 'interview'
    };

    // Upsert the draft - if exists update, if not create
    const result = await drafts.updateOne(
      { email, content_type: draftDoc.content_type },
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
    return jsonError(error, "Unable to save draft");
  }
}

// Get the caller's own draft
export async function GET(req) {
  const auth = await requireSession();
  if (auth.response) return auth.response;

  try {
    const db = await getMongoDb({ mode: "read" });
    const drafts = db.collection("drafts");
    // Read from the session, not ?email= -- that returned any user's unpublished draft.
    const email = auth.email;
    const contentType = req.nextUrl.searchParams.get('contentType') || 'interview';

    const draft = await drafts.findOne({ email, content_type: contentType });

    if (!draft) {
      return NextResponse.json({ message: "No draft found" }, { status: 404 });
    }

    return NextResponse.json(draft, { status: 200 });

  } catch (error) {
    console.error("Error retrieving draft:", error);
    return jsonError(error, "Unable to load draft");
  }
}
