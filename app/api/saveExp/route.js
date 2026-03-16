import { nanoid } from "nanoid";
import slugify from "slugify";
import { getCollection } from "@/lib/server/mongodb";
import { badRequest, ok, serverError } from "@/lib/server/http";
import { hasRequiredFields, trimString } from "@/lib/server/validation";
import { sendSubmissionAcknowledgement } from "@/lib/server/email";

async function buildUniqueUid(experience, baseText) {
  const baseSlug = slugify(baseText, { lower: true, strict: true }) || "experience";
  let uid = `${baseSlug}-${nanoid(6)}`;

  while (await experience.findOne({ uid })) {
    uid = `${baseSlug}-${nanoid(6)}`;
  }

  return uid;
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!hasRequiredFields(body, ["exp_text", "company", "name", "email"])) {
      return badRequest("exp_text, company, name and email are required");
    }

    const payload = {
      exp_text: trimString(body.exp_text),
      company: trimString(body.company),
      branch: trimString(body.branch),
      batch: trimString(body.batch),
      profile_pic: trimString(body.profile_pic),
      name: trimString(body.name),
      role: trimString(body.role),
      email: trimString(body.email),
    };

    const experience = await getCollection("experience");
    const backup = await getCollection("backup");

    const uid = await buildUniqueUid(
      experience,
      `${payload.name} experience at ${payload.company} ${payload.role} ${payload.batch}`
    );

    const now = new Date().toISOString();
    const doc = {
      uid,
      ...payload,
      date: now,
      views: 0,
    };

    const result = await experience.insertOne(doc);
    await backup.insertOne(doc);

    if (!result.acknowledged) {
      return serverError(new Error("Insert was not acknowledged"), "Failed to save experience");
    }

    try {
      await sendSubmissionAcknowledgement({
        name: payload.name,
        email: payload.email,
        uid,
      });
    } catch (emailError) {
      console.error("Failed to send acknowledgment email", emailError);
    }

    return ok({ message: "Experience saved successfully", uid });
  } catch (error) {
    return serverError(error, "Failed to save experience");
  }
}
