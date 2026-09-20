import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

// Load .env variables
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || "").trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[match[1]] = val;
      }
    }
  }
} catch (e) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://oriibywxhetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "f02a772d9b4250530eca89e6dd5c08a2";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "669fc7ad0840c6155de1df05b7fb5e36";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "a012275eacb20df0c4ed0fa39ea98a1799d956ec0221aa00d8c5ad535b2c6e4e";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "priora-media";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-dcd7a358fb574745aa0887a6d68b20e7.r2.dev";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function migrateFile(url, folder = "products") {
  if (!url || typeof url !== "string") return url;
  // If already on R2, return as is
  if (url.includes("r2.dev") || url.includes("media.priorabykp.co.in")) {
    return url;
  }

  try {
    console.log(`Fetching from Supabase: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Could not fetch ${url} (status: ${res.status})`);
      return url;
    }

    const contentType = res.headers.get("content-type") || "image/webp";
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract or generate filename
    const urlPath = new URL(url).pathname;
    const filename = urlPath.split("/").pop() || `${Date.now()}.webp`;
    const key = `${folder}/${filename}`;

    // Upload to Cloudflare R2 with immutable cache header
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    await s3.send(command);
    const r2Url = `${R2_PUBLIC_URL}/${key}`;
    console.log(`✅ Uploaded to R2: ${r2Url}`);
    return r2Url;
  } catch (err) {
    console.error(`Migration error for ${url}:`, err);
    return url;
  }
}

async function run() {
  console.log("🚀 Starting Supabase to Cloudflare R2 media migration...");

  // 1. Migrate product_images
  const { data: productImages, error: pImgErr } = await supabase
    .from("product_images")
    .select("id, product_id, url");

  if (pImgErr) {
    console.error("Error fetching product_images:", pImgErr);
  } else if (productImages) {
    console.log(`Found ${productImages.length} product gallery images to check.`);
    for (const img of productImages) {
      if (img.url && img.url.includes("supabase.co")) {
        const newUrl = await migrateFile(img.url, "products");
        if (newUrl !== img.url) {
          await supabase.from("product_images").update({ url: newUrl }).eq("id", img.id);
          console.log(`Updated product_images row ${img.id}`);
        }
      }
    }
  }

  // 2. Migrate categories images
  const { data: categories } = await supabase.from("categories").select("id, name, image_url");
  if (categories) {
    for (const cat of categories) {
      if (cat.image_url && cat.image_url.includes("supabase.co")) {
        const newUrl = await migrateFile(cat.image_url, "categories");
        if (newUrl !== cat.image_url) {
          await supabase.from("categories").update({ image_url: newUrl }).eq("id", cat.id);
          console.log(`Updated category ${cat.name} image URL`);
        }
      }
    }
  }

  // 3. Migrate banners
  const { data: banners } = await supabase.from("banners").select("id, image_url, video_url");
  if (banners) {
    for (const ban of banners) {
      let updates = {};
      if (ban.image_url && ban.image_url.includes("supabase.co")) {
        updates.image_url = await migrateFile(ban.image_url, "banners");
      }
      if (ban.video_url && ban.video_url.includes("supabase.co")) {
        updates.video_url = await migrateFile(ban.video_url, "banners");
      }
      if (Object.keys(updates).length > 0) {
        await supabase.from("banners").update(updates).eq("id", ban.id);
        console.log(`Updated banner ${ban.id}`);
      }
    }
  }

  console.log("🎉 Cloudflare R2 Migration process completed successfully!");
}

run();
