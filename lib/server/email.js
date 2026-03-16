import nodemailer from "nodemailer";
import { SITE_URL } from "./config";

function canSendEmail() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendSubmissionAcknowledgement({ name, email, uid }) {
  if (!canSendEmail()) {
    return { sent: false, reason: "EMAIL_USER/EMAIL_PASS not configured" };
  }

  const transporter = getTransporter();
  const postUrl = `${SITE_URL}/single/${uid}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Thank you for sharing your experience",
    html: `
      <p>Hello ${name},</p>
      <p>Thank you for sharing your interview experience with the community.</p>
      <p>You can view your post here: <a href="${postUrl}" target="_blank" rel="noreferrer">${postUrl}</a></p>
      <p>Regards,<br/>theInterview Team</p>
    `,
  });

  return { sent: true };
}

export async function sendGenericAcknowledgement({ userEmail, userName }) {
  if (!canSendEmail()) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured");
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Acknowledgment: Experience Submission Received",
    html: `
      <p>Dear ${userName},</p>
      <p>Thank you for submitting your experience. We have received your post successfully.</p>
      <p>Best regards,<br/>Team</p>
    `,
  });
}
