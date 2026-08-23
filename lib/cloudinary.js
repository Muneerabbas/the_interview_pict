import { createHash } from "node:crypto";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
/**
 * Per-uploader folder. Uploads used to share one flat folder, so any signed-in
 * user could delete another user's images (the public_id is recoverable from the
 * post HTML). Keep this the single definition -- /api/upload signs it and
 * /api/delete-image authorizes against it.
 */
export function userFolder(email) {
  return `interview-pict/articles/${createHash("sha256").update(String(email)).digest("hex").slice(0, 16)}`;
}
