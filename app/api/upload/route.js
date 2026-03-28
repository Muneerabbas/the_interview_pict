import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    // eslint-disable-next-line no-unused-vars
    const body = await req.json().catch(() => ({}));

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
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
