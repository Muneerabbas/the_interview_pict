import { getCollection } from "@/lib/server/mongodb";
import { badRequest, ok, serverError } from "@/lib/server/http";
import { trimString } from "@/lib/server/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const gmail = trimString(body.gmail).toLowerCase();
    const name = trimString(body.name);
    const image = trimString(body.image);

    if (!gmail || !name) {
      return badRequest("Gmail and name are required");
    }

    const users = await getCollection("user");
    const existingUser = await users.findOne({ gmail });

    const now = new Date().toISOString();
    let result;

    if (existingUser) {
      result = await users.updateOne(
        { gmail },
        {
          $set: {
            name,
            image,
            updatedAt: now,
          },
        }
      );
    } else {
      result = await users.insertOne({
        gmail,
        name,
        image,
        createdAt: now,
        updatedAt: now,
      });
    }

    return ok({
      message: "User saved successfully",
      operation: existingUser ? "updated" : "inserted",
      result,
    });
  } catch (error) {
    return serverError(error, "Failed to save user");
  }
}
