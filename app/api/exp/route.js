import { getCollection } from "@/lib/server/mongodb";
import { badRequest, notFound, ok, serverError } from "@/lib/server/http";
import { trimString } from "@/lib/server/validation";

export async function GET(req) {
  try {
    const uid = trimString(req.nextUrl.searchParams.get("uid"));

    if (!uid) {
      return badRequest("Missing uid query parameter");
    }

    const experience = await getCollection("experience");
    const data = await experience.findOneAndUpdate(
      { uid },
      { $inc: { views: 1 } },
      { returnDocument: "after" }
    );

    if (!data) {
      return notFound("Document not found");
    }

    return ok(data);
  } catch (error) {
    return serverError(error, "Failed to fetch experience");
  }
}
