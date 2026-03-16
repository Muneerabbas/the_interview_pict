import { getCollection } from "@/lib/server/mongodb";
import { badRequest, ok, serverError } from "@/lib/server/http";
import { trimString } from "@/lib/server/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = trimString(body.email);

    if (!email) {
      return badRequest("Email is required");
    }

    const experience = await getCollection("experience");
    const posts = await experience.find({ email }).sort({ date: -1 }).toArray();

    return ok({ posts });
  } catch (error) {
    return serverError(error, "Failed to fetch profile posts");
  }
}
