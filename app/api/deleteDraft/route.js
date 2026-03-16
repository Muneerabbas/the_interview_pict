import { getCollection } from "@/lib/server/mongodb";
import { badRequest, notFound, ok, serverError } from "@/lib/server/http";
import { trimString } from "@/lib/server/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = trimString(body.email);

    if (!email) {
      return badRequest("Email is required");
    }

    const drafts = await getCollection("drafts");
    const result = await drafts.deleteOne({ email });

    if (result.deletedCount === 0) {
      return notFound("No draft found to delete");
    }

    return ok({ message: "Draft deleted successfully" });
  } catch (error) {
    return serverError(error, "Failed to delete draft");
  }
}
