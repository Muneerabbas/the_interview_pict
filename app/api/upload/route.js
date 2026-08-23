import cloudinary from "@/lib/cloudinary";
import { requireSession } from "@/lib/auth";

export async function POST(req) {
  const auth = await requireSession();
  if (auth.response) return auth.response;

  try {
    const timestamp = Math.floor(Date.now() / 1000);

    // Keep signed params exactly aligned with what the client submits.
    // Use string values to avoid boolean normalization mismatches.
    const paramsToSign = {
      folder: "interview-pict/articles",
      timestamp: String(timestamp),
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return Response.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: paramsToSign.folder,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    return Response.json({ error: "Could not sign upload" }, { status: 500 });
  }
}
