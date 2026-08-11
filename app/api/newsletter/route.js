import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { jsonError } from "@/lib/api-response";

export async function POST(req) {
    try {
        const { email } = await req.json();

        // Check if the email is a Gmail address
        if (typeof email !== "string" || !email.endsWith("@gmail.com")) {
            return NextResponse.json({ success: false, error: "Only Gmail addresses are allowed", code: "VALIDATION_ERROR" }, { status: 400 });
        }

        const db = await getMongoDb({ mode: "write" });
        const newsletters = db.collection("newsletter");

        // Check if the email already exists
        const existingEmail = await newsletters.findOne({ email });

        if (!existingEmail) {
            await newsletters.insertOne({ email });
        }

        return NextResponse.json({ success: true, message: "Email saved successfully" }, { status: 200 });
    } catch (error) {
        console.error("Newsletter API error:", error?.message || error);
        return jsonError(error, "Unable to subscribe");
    }
}
