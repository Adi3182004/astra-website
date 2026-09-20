/**
 * Cloudflare R2 Upload & CDN Integration
 * Uploads optimized media directly to Cloudflare R2 object storage with long-term edge caching.
 */

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || "https://media.priorabykp.co.in";
const R2_CUSTOM_DOMAIN = import.meta.env.VITE_R2_CUSTOM_DOMAIN || "https://media.priorabykp.co.in";

export interface R2UploadResult {
  publicUrl: string;
  key: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file directly to Cloudflare R2 with automatic fallback through the server endpoint.
 */
export async function uploadToR2(
  file: File,
  folder = "uploads",
  customFilename?: string
): Promise<R2UploadResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "webp";
  const baseName = customFilename
    ? customFilename.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "")
    : file.name.replace(/\.[^/.]+$/, "").toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");

  const filename = `${baseName || Date.now()}.${ext}`;

  // Method 1: Try direct presigned PUT URL
  try {
    const res = await fetch("/api/r2-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get-upload-url",
        filename,
        contentType: file.type || "image/webp",
        folder,
      }),
    });

    if (res.ok) {
      const { uploadUrl, publicUrl, key } = await res.json();
      if (uploadUrl) {
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "image/webp",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
          body: file,
        });

        if (uploadRes.ok) {
          return { publicUrl, key };
        }
      }
    }
  } catch (directErr) {
    console.warn("Direct R2 presigned PUT failed, trying direct API upload:", directErr);
  }

  // Method 2: Direct server-side upload to R2 (bypasses browser CORS restrictions completely)
  const base64Data = await fileToBase64(file);
  const serverRes = await fetch("/api/r2-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "upload",
      filename,
      contentType: file.type || "image/webp",
      folder,
      base64Data,
    }),
  });

  if (!serverRes.ok) {
    const errJson = await serverRes.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to upload to Cloudflare R2 (${serverRes.status})`);
  }

  const result = await serverRes.json();
  return {
    publicUrl: result.publicUrl,
    key: result.key,
  };
}

/**
 * Checks if a URL is hosted on Cloudflare R2.
 */
export function isR2Url(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.includes("r2.dev") ||
    url.includes("r2.cloudflarestorage.com") ||
    url.includes("media.priorabykp.co.in")
  );
}
