import { getCollection } from "@/lib/server/mongodb";
import { notFound, ok, serverError } from "@/lib/server/http";

export async function GET() {
  try {
    const dropdowns = await getCollection("dropdowns");
    const doc = await dropdowns.findOne({});

    if (!doc?.companies) {
      return notFound("No companies found in the database");
    }

    return ok({ success: true, data: doc.companies });
  } catch (error) {
    return serverError(error, "An error occurred while fetching companies");
  }
}
