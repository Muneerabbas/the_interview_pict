import { getCollection } from "@/lib/server/mongodb";
import { badRequest, notFound, ok, serverError } from "@/lib/server/http";
import { trimString } from "@/lib/server/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = trimString(body.email);

    if (!email) {
      return badRequest("User email is required");
    }

    const now = new Date().toISOString();
    const draft = {
      exp_text: trimString(body.exp_text),
      company: trimString(body.company),
      branch: trimString(body.branch),
      batch: trimString(body.batch),
      profile_pic: trimString(body.profile_pic),
      name: trimString(body.name),
      role: trimString(body.role),
      email,
      last_edited: now,
      status: "draft",
    };

    const drafts = await getCollection("drafts");
    await drafts.updateOne(
      { email },
      {
        $set: draft,
        $setOnInsert: { created_at: now },
      },
      { upsert: true }
    );

    return ok({ message: "Draft saved successfully", email });
  } catch (error) {
    return serverError(error, "Failed to save draft");
  }
}

export async function GET(req) {
  try {
    const email = trimString(req.nextUrl.searchParams.get("email"));

    if (!email) {
      return badRequest("Email is required");
    }

    const drafts = await getCollection("drafts");
    const draft = await drafts.findOne({ email });

    if (!draft) {
      return notFound("No draft found");
    }

    return ok(draft);
  } catch (error) {
    return serverError(error, "Failed to retrieve draft");
  }
}
