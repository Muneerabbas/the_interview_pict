import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { userEmail, userName } = await req.json();

    if (!userEmail || !userName) {
      return new Response(JSON.stringify({ error: "Missing email or name" }), { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return new Response(
        JSON.stringify({ message: "Email disabled: SMTP credentials not configured" }),
        { status: 200 }
      );
    }

    // Configure Nodemailer with Gmail SMTP (or another provider)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email
      to: userEmail, // Recipient email
      subject: "Acknowledgment: Experience Submission Received",
      html: `
        <p>Dear ${userName},</p>
        <p>Thank you for submitting your experience! We have received your post successfully.</p>
        <p>Best regards,<br>Team</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: "Email sent successfully" }), { status: 200 });

  } catch (error) {
    console.warn("Email send skipped/failed:", error?.code || error?.message || error);
    return new Response(JSON.stringify({ message: "Email delivery failed but request accepted" }), { status: 200 });
  }
}
