import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { nanoid } from "nanoid";
import slugify from "slugify";
import nodemailer from "nodemailer";


// Create a persistent MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("int-exp");
const experience = db.collection("experience");
const user = db.collection("user");
const backup = db.collection("backup");

// Ensure MongoDB is connected
(async () => {
  await client.connect();
  console.log("Connected to MongoDB");
})();

export async function POST(req) {
  try {
    const { exp_text, company, branch, batch, profile_pic, name, role,email} = await req.json();
    if (!exp_text || !company || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Validate token
    const userDoc = await user.findOne({ email });

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
      uid, exp_text, company, branch, batch, profile_pic, name, date: now, views: 0, role,email
    });
    const bc = await backup.insertOne({
      uid, exp_text, company, branch, batch, profile_pic, name, date: now, views: 0, role,email
    });

    if (!result.acknowledged) {
      return NextResponse.json({ message: "Failed to save experience" }, { status: 500 });
    }

     // Send acknowledgment email
     await sendAcknowledgmentEmail(name, email, uid);

    return NextResponse.json({ message: "Experience saved successfully", uid }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

async function sendAcknowledgmentEmail(name, email,uid) {
  try {
    console.log("📩 Preparing to send email to:", email); // Debug log

    const postUrl = uid; // Replace with your actual website URL

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🌟 Thank You for Sharing Your Experience! 🌟",
      html: `
        <p>Hello ${name},</p>
        <p>We truly appreciate you for taking the time to share your interview experience on our platform! 🙌</p>
        <p>Your insights will be incredibly helpful for the next batch of candidates preparing for their placements.</p>
        <p>Here’s your post: <a href="https://the-interview-pict.vercel.app/single/${postUrl}" target="_blank">${postUrl}</a></p>
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
    console.error("❌ Failed to send email:", error);
  }
}
