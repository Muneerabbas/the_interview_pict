import { badRequest, ok, serverError } from "@/lib/server/http";
import { sendGenericAcknowledgement } from "@/lib/server/email";
import { trimString } from "@/lib/server/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const userEmail = trimString(body.userEmail);
    const userName = trimString(body.userName);

    if (!userEmail || !userName) {
      return badRequest("Missing email or name");
    }

    await sendGenericAcknowledgement({ userEmail, userName });
    return ok({ message: "Email sent successfully" });
  } catch (error) {
    return serverError(error, "Failed to send email");
  }
}
