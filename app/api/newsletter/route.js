import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeEmail } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

const GMAIL_RE = /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@gmail\.com$/;

export async function POST(req) {
    const limited = await checkRateLimit(req, { key: "newsletter", limit: 5, windowSeconds: 600 });
    if (limited) return limited;

    try {
        const email = normalizeEmail((await req.json().catch(() => ({}))).email);

        // endsWith("@gmail.com") happily accepted "<script>foo@gmail.com".
        if (!GMAIL_RE.test(email)) {
            return NextResponse.json(
                { success: false, error: "Enter a valid Gmail address", code: "VALIDATION_ERROR" },
                { status: 400 }
            );
        }

        const db = await getMongoDb({ mode: "write" });

        // Upsert instead of findOne-then-insert: double submits raced into duplicates.
        await db.collection("newsletter").updateOne(
            { email },
            { $setOnInsert: { email, createdAt: new Date() } },
            { upsert: true }
        );

        return NextResponse.json({ success: true, message: "Subscribed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Newsletter API error:", error?.message || error);
        return jsonError(error, "Unable to subscribe");
    }
}
