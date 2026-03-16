import { getCollection } from "@/lib/server/mongodb";
import { badRequest, ok, serverError } from "@/lib/server/http";
import { isValidEmail, trimString } from "@/lib/server/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = trimString(body.email).toLowerCase();

    if (!isValidEmail(email)) {
      return badRequest("A valid email is required");
    }

    if (!email.endsWith("@gmail.com")) {
      return badRequest("Only Gmail addresses are allowed");
    }

    const newsletter = await getCollection("newsletter");
    const existing = await newsletter.findOne({ email });

    if (!existing) {
      await newsletter.insertOne({ email, createdAt: new Date().toISOString() });
    }

    return ok({ message: "Email saved successfully" });
  } catch (error) {
    return serverError(error, "Failed to save newsletter email");
  }
}
