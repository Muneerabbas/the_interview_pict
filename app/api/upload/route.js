import cloudinary, { userFolder } from "@/lib/cloudinary";
import { requireSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req) {
  const auth = await requireSession();
  if (auth.response) return auth.response;

  // Each signature is a ticket for a 4MB upload billed to our Cloudinary account.
  const limited = await checkRateLimit(req, { key: "upload", limit: 60, windowSeconds: 600 });
  if (limited) return limited;

  try {
    const timestamp = Math.floor(Date.now() / 1000);

    // Keep signed params exactly aligned with what the client submits.
    // Use string values to avoid boolean normalization mismatches.
    const paramsToSign = {
      folder: userFolder(auth.email),
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
