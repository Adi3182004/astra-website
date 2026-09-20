import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "f02a772d9b4250530eca89e6dd5c08a2";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "669fc7ad0840c6155de1df05b7fb5e36";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "a012275eacb20df0c4ed0fa39ea98a1799d956ec0221aa00d8c5ad535b2c6e4e";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "priora-media";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://media.priorabykp.co.in";
const R2_CUSTOM_DOMAIN = process.env.R2_CUSTOM_DOMAIN || "https://media.priorabykp.co.in";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { action } = req.body || req.query || {};

    // 1. Direct Upload to R2 (bypasses browser CORS completely)
    if (action === "upload") {
      const { filename, contentType, folder = "uploads", base64Data } = req.body || {};

      if (!filename || !base64Data) {
        return res.status(400).json({ error: "Filename and base64Data are required for direct upload" });
      }

      const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
      const key = cleanFolder ? `${cleanFolder}/${filename}` : filename;
      const buffer = Buffer.from(base64Data.replace(/^data:[^;]+;base64,/, ""), "base64");

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType || "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      });

      await s3.send(command);

      const publicUrl = `${R2_PUBLIC_URL}/${key}`;
      const customDomainUrl = `${R2_CUSTOM_DOMAIN}/${key}`;

      return res.status(200).json({
        success: true,
        publicUrl,
        customDomainUrl,
        key,
      });
    }

    // 2. Get Presigned Upload URL for direct client-to-R2 upload
    if (action === "get-upload-url" || (!action && req.method === "POST")) {
      const { filename, contentType, folder = "uploads" } = req.body || {};

      if (!filename) {
        return res.status(400).json({ error: "Filename is required" });
      }

      const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
      const key = cleanFolder ? `${cleanFolder}/${filename}` : filename;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType || "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      });

      // Generate a 15-minute presigned PUT URL
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

      // Clean public URL
      const publicUrl = `${R2_PUBLIC_URL}/${key}`;
      const customDomainUrl = `${R2_CUSTOM_DOMAIN}/${key}`;

      return res.status(200).json({
        uploadUrl,
        publicUrl,
        customDomainUrl,
        key,
      });
    }

    // 3. Delete Object from R2
    if (action === "delete" || req.method === "DELETE") {
      const { key } = req.body || req.query || {};

      if (!key) {
        return res.status(400).json({ error: "Object key is required" });
      }

      const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      await s3.send(command);
      return res.status(200).json({ success: true, deletedKey: key });
    }

    return res.status(400).json({ error: "Invalid action or method" });
  } catch (err) {
    console.error("Cloudflare R2 API Error:", err);
    return res.status(500).json({ error: err.message || "Failed to process R2 storage operation" });
  }
}
