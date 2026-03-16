import { getCollection } from "@/lib/server/mongodb";
import { badRequest, notFound, ok, serverError } from "@/lib/server/http";
import { hasRequiredFields, trimString } from "@/lib/server/validation";

export async function PUT(req) {
  try {
    const body = await req.json();

    if (!hasRequiredFields(body, ["uid", "email"])) {
      return badRequest("uid and email are required");
    }

    const uid = trimString(body.uid);
    const email = trimString(body.email);

    const updates = {
      updated_at: new Date().toISOString(),
    };

    ["exp_text", "company", "branch", "batch", "role"].forEach((field) => {
      if (typeof body[field] === "string") {
        updates[field] = trimString(body[field]);
      }
    });

    const experience = await getCollection("experience");
    const result = await experience.updateOne({ uid, email }, { $set: updates });

    if (result.matchedCount === 0) {
      return notFound("No matching experience found");
    }

    return ok({ message: "Experience updated successfully", uid });
  } catch (error) {
    return serverError(error, "Failed to update experience");
  }
}
