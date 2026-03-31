import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import slugify from "slugify";
import nodemailer from "nodemailer";
import redis from "@/lib/redis";
import { getDefaultFeedInvalidationKeys, incrementFeedVersion } from "@/lib/feedCache";
import { getMongoDb } from "@/lib/mongodb";


async function invalidateAfterWrite(email) {
  if (!email || !redis) return;

  const keys = [
    `profile_posts_${encodeURIComponent(email)}`,
    `public_profile_full:${email}`,
    `user_profile_data:${email}`
  ];

  try {
    await redis.del(keys);
    console.log("[cache] User profile invalidation completed");
  } catch (err) {
    console.warn("[cache] Invalidation failed:", err?.message || err);
  }
}

export async function POST(req) {
  try {
    const { exp_text, college, company, branch, batch, profile_pic, name, role, email } = await req.json();
    if (!exp_text || !company || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const db = await getMongoDb();
    const experience = db.collection("experience");
    const backup = db.collection("backup");

    // Generate a meaningful UID: "google-sde-2025-nanoid"
    const baseSlug = slugify(`${name}'s experience at ${company} ${role} ${batch} `, { lower: true, strict: true });
    let uid = `${baseSlug}-${nanoid(6)}`; // Append a short unique ID

    // Ensure UID uniqueness in DB
    while (await experience.findOne({ uid })) {
      uid = `${baseSlug}-${nanoid(6)}`; // Regenerate if it already exists
    }

    // Save experience to DB
    const now = new Date().toISOString();
    const result = await experience.insertOne({
      uid, exp_text, college, company, branch, batch, profile_pic, name, date: now, views: 0, role, email
    });
    const bc = await backup.insertOne({
      uid, exp_text, college, company, branch, batch, profile_pic, name, date: now, views: 0, role, email
    });

    // Sync with Company collection
    try {
      const companySlug = slugify(company, { lower: true, strict: true });
      await db.collection("company").updateOne(
        { name: company },
        {
          $inc: { "stats.interviewsCount": 1 },
          $setOnInsert: {
            slug: companySlug,
            about: `Company ${company} interview experience details.`,
            tags: ["Interview"],
            "stats.reviewsCount": 0,
            "stats.rating": 5
          }
        },
        { upsert: true }
      );
    } catch (companyError) {
      console.error("Failed to sync company state:", companyError);
      // Non-blocking error
    }

    if (!result.acknowledged) {
      return NextResponse.json({ message: "Failed to save experience" }, { status: 500 });
    }

    await invalidateAfterWrite(email);

    // Send acknowledgment email
    const siteUrl = req.nextUrl?.origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await sendAcknowledgmentEmail(name, email, uid, siteUrl);

    return NextResponse.json({ message: "Experience saved successfully", uid }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

async function sendAcknowledgmentEmail(name, email, uid, siteUrl) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn("Email skipped: EMAIL_USER/EMAIL_PASS are not configured.");
    return;
  }

  try {
    console.log("📩 Preparing to send email to:", email); // Debug log

    const postUrl = `${siteUrl}/single/${uid}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "🌟 Thank You for Sharing Your Experience! 🌟",
      html: `
        <p>Hello ${name},</p>
        <p>We truly appreciate you for taking the time to share your interview experience on our platform! 🙌</p>
        <p>Your insights will be incredibly helpful for the next batch of candidates preparing for their placements.</p>
        <p>Here’s your post: <a href="${postUrl}" target="_blank">${postUrl}</a></p>
        <p>You can edit or delete your post anytime to keep it updated!</p>
        <br>
        <p>Best Regards,</p>
        <p><strong>theInterview Team</strong></p>
      `,
    };


    console.log("📤 Sending email..."); // Debug log
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to", email);
  } catch (error) {
    console.warn("❌ Failed to send email:", error?.code || error?.message || error);
  }
}
