import { getCollection } from "@/lib/server/mongodb";
import { badRequest, notFound, ok, serverError } from "@/lib/server/http";
import { hasRequiredFields, trimString } from "@/lib/server/validation";

export async function DELETE(req) {
  try {
    const body = await req.json();
    if (!hasRequiredFields(body, ["uid", "email"])) {
      return badRequest("Missing required fields: uid and email");
    }

    const uid = trimString(body.uid);
    const email = trimString(body.email);

    const experience = await getCollection("experience");
    const result = await experience.deleteOne({ uid, email });

    if (result.deletedCount === 0) {
      return notFound("No matching experience found");
    }

    return ok({ message: "Experience deleted successfully" });
  } catch (error) {
    return serverError(error, "Failed to delete experience");
  }
}
