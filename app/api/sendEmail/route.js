import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { escapeHtml } from "@/lib/utils";

export async function POST(req) {
  // Without this the endpoint is an open relay: the caller picked both the
  // recipient and the HTML body, and it sent from our Gmail account.
  const auth = await requireSession();
  if (auth.response) return auth.response;

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { success: false, message: "Email disabled: SMTP credentials not configured" },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: auth.email,
      subject: "Acknowledgment: Experience Submission Received",
      html: `
        <p>Dear ${escapeHtml(auth.name || "there")},</p>
        <p>Thank you for submitting your experience! We have received your post successfully.</p>
        <p>Best regards,<br>Team</p>
      `,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.warn("Email send failed:", error?.code || error?.message || error);
    return NextResponse.json(
      { success: false, message: "Email delivery failed" },
      { status: 502 }
    );
  }
}
