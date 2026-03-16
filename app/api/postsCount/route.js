import { getCollection } from "@/lib/server/mongodb";
import { ok, serverError } from "@/lib/server/http";

export async function GET() {
  try {
    const experience = await getCollection("experience");
    const count = await experience.countDocuments();
    return ok({ count });
  } catch (error) {
    return serverError(error, "Failed to fetch post count");
  }
}
