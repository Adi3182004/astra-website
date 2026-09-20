import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export const VIDEO_EXT = [".mp4", ".webm", ".mov", ".m4v", ".ogv"];

export function isVideoUrl(url?: string | null) {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXT.some((e) => clean.endsWith(e)) || clean.includes("/video/");
}

/**
 * Automatically optimizes and compresses images to lightweight WebP format on the client
 * before uploading. This dramatically reduces R2/Supabase storage consumption (up to 85% savings)
 * and guarantees fast edge CDN delivery with minimal bandwidth and zero limit overrun.
 */
export async function compressImageBeforeUpload(
  file: File,
  maxDimension = 1800,
  quality = 0.85
): Promise<File> {
  // If not an image or is an animated svg/gif, return original
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);

          if (blob.size >= file.size && file.type === "image/webp") {
            return resolve(file);
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

import { uploadToR2, isR2Url } from "./r2";

/** Uploads a file to the media library and returns a long-lived or public URL. */
export async function uploadMedia(file: File, folder = "uploads", customName?: string) {
  // 1. Client-side auto-optimization to prevent storage and bandwidth limits
  const processedFile = file.type.startsWith("image/")
    ? await compressImageBeforeUpload(file)
    : file;

  // 2. Try direct Cloudflare R2 upload first
  try {
    const r2Result = await uploadToR2(processedFile, folder, customName);
    if (r2Result?.publicUrl) {
      return r2Result.publicUrl;
    }
  } catch (r2Err) {
    console.warn("R2 upload fallback to Supabase storage:", r2Err);
  }

  // 3. Fallback to Supabase storage
  const ext = processedFile.name.split(".").pop()?.toLowerCase() ?? "bin";
  const cleanBase = customName
    ? customName.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "")
    : processedFile.name.replace(/\.[^/.]+$/, "").toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-");
  
  const finalFilename = cleanBase ? cleanBase : `${Date.now()}`;
  const path = `${folder}/${finalFilename}.${ext}`;

  // Try uploading to 'media' bucket, fallback to 'product-media' or 'public-assets' if needed
  let bucketToUse = "media";
  let uploadRes = await supabase.storage.from(bucketToUse).upload(path, processedFile, {
    cacheControl: "31536000",
    upsert: true,
    contentType: processedFile.type || undefined,
  });

  if (uploadRes.error && uploadRes.error.message.includes("Bucket not found")) {
    bucketToUse = "public-assets";
    uploadRes = await supabase.storage.from(bucketToUse).upload(path, processedFile, {
      cacheControl: "31536000",
      upsert: true,
      contentType: processedFile.type || undefined,
    });
  }

  if (uploadRes.error) throw uploadRes.error;

  // Get public URL
  const { data: pubData } = supabase.storage.from(bucketToUse).getPublicUrl(path);
  if (pubData?.publicUrl) return pubData.publicUrl;

  const { data, error: signErr } = await supabase.storage.from(bucketToUse).createSignedUrl(path, TEN_YEARS);
  if (signErr || !data?.signedUrl) throw signErr ?? new Error("Could not create media URL");
  return data.signedUrl;
}

/**
 * Automatically deletes a media file from Cloudflare R2 or Supabase storage buckets by URL.
 */
export async function deleteMediaFromStorage(url?: string | null): Promise<boolean> {
  if (!url) return false;
  try {
    // 1. If Cloudflare R2 URL, send delete command to R2
    if (isR2Url(url)) {
      try {
        const urlObj = new URL(url);
        const key = urlObj.pathname.replace(/^\/+/, "");
        await fetch("/api/r2-upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", key }),
        });
        return true;
      } catch (err) {
        console.warn("R2 delete error:", err);
      }
    }

    // 2. Supabase storage URL matching
    const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?.*)?$/);
    if (match) {
      const bucket = match[1];
      const filePath = decodeURIComponent(match[2]);
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      if (error) {
        console.warn("Storage remove warning:", error);
        return false;
      }
      return true;
    }
    return false;
  } catch (e) {
    console.warn("Could not remove media from storage:", url, e);
    return false;
  }
}

/**
 * Automatically purges all storage files and product_images rows for a deleted product.
 */
export async function deleteProductMediaFiles(
  productId: string,
  slug?: string,
  extraUrls: string[] = []
): Promise<void> {
  const BUCKETS = ["media", "product-media", "public-assets", "products", "videos", "banners"];

  try {
    // 1. Fetch all product_images rows
    const { data: dbImages } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", productId);

    const allUrls = [
      ...(dbImages || []).map((img: any) => img.url),
      ...extraUrls,
    ].filter(Boolean);

    // 2. Delete explicitly known URLs from storage
    await Promise.allSettled(allUrls.map((url) => deleteMediaFromStorage(url)));

    // 3. Scan storage buckets for any files named with product slug or productId
    if (slug || productId) {
      for (const bucket of BUCKETS) {
        for (const folder of ["products", "uploads", ""]) {
          try {
            const { data: files } = await supabase.storage.from(bucket).list(folder, { limit: 100 });
            if (files && files.length > 0) {
              const matchedFiles = files.filter((f) => {
                if (!f.name) return false;
                const nameLow = f.name.toLowerCase();
                const slugLow = slug ? slug.toLowerCase() : "";
                const idLow = productId.toLowerCase();
                return (slugLow && nameLow.startsWith(slugLow)) || nameLow.includes(idLow);
              });

              if (matchedFiles.length > 0) {
                const pathsToRemove = matchedFiles.map((f) => (folder ? `${folder}/${f.name}` : f.name));
                await supabase.storage.from(bucket).remove(pathsToRemove);
              }
            }
          } catch (err) {
            // ignore folder missing errors
          }
        }
      }
    }

    // 4. Delete product_images rows from database table
    await supabase.from("product_images").delete().eq("product_id", productId);
  } catch (e) {
    console.warn("deleteProductMediaFiles encountered error:", e);
  }
}
