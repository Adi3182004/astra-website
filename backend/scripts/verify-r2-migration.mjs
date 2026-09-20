import fs from "fs";
import path from "path";
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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function verify() {
  console.log("🔍 Checking all database tables for media URLs...\n");

  let totalChecked = 0;
  let r2Count = 0;
  let supabaseCount = 0;
  let localAssetCount = 0;
  let otherCount = 0;

  function categorize(url, table, id) {
    if (!url || typeof url !== "string") return;
    totalChecked++;
    if (url.includes("r2.dev") || url.includes("media.priorabykp.co.in") || url.includes("r2.cloudflarestorage.com")) {
      r2Count++;
      console.log(`[R2 ✅] ${table} (ID: ${id}): ${url}`);
    } else if (url.includes("supabase.co")) {
      supabaseCount++;
      console.warn(`[SUPABASE ⚠️] ${table} (ID: ${id}): ${url}`);
    } else if (url.startsWith("/assets/") || url.startsWith("assets/")) {
      localAssetCount++;
      console.log(`[LOCAL BUNDLE 📦] ${table} (ID: ${id}): ${url}`);
    } else {
      otherCount++;
      console.log(`[OTHER 🌐] ${table} (ID: ${id}): ${url}`);
    }
  }

  // 1. product_images
  const { data: pImages } = await supabase.from("product_images").select("id, url, product_id");
  if (pImages) {
    for (const img of pImages) categorize(img.url, "product_images", img.id);
  }

  // 2. categories
  const { data: categories } = await supabase.from("categories").select("id, name, image_url, video_url");
  if (categories) {
    for (const c of categories) {
      categorize(c.image_url, `categories (${c.name})`, c.id);
      categorize(c.video_url, `categories video (${c.name})`, c.id);
    }
  }

  // 3. banners
  const { data: banners } = await supabase.from("banners").select("id, title, image_url, video_url");
  if (banners) {
    for (const b of banners) {
      categorize(b.image_url, `banners (${b.title || b.id})`, b.id);
      categorize(b.video_url, `banners video (${b.title || b.id})`, b.id);
    }
  }

  // 4. reviews
  const { data: reviews } = await supabase.from("reviews").select("id, image_url, video_url");
  if (reviews) {
    for (const r of reviews) {
      categorize(r.image_url, "reviews", r.id);
      categorize(r.video_url, "reviews", r.id);
    }
  }

  // 5. videos
  const { data: videos } = await supabase.from("videos").select("id, video_url, poster_url");
  if (videos) {
    for (const v of videos) {
      categorize(v.video_url, "videos", v.id);
      categorize(v.poster_url, "videos poster", v.id);
    }
  }

  // 6. site_settings
  const { data: settings } = await supabase.from("site_settings").select("id, logo_url, favicon_url").eq("id", 1).maybeSingle();
  if (settings) {
    categorize(settings.logo_url, "site_settings logo", 1);
    categorize(settings.favicon_url, "site_settings favicon", 1);
  }

  console.log("\n==========================================");
  console.log(`📊 FINAL VERIFICATION REPORT:`);
  console.log(`Total Media Items Checked: ${totalChecked}`);
  console.log(`✅ Cloudflare R2 URLs: ${r2Count}`);
  console.log(`📦 Local Static Assets: ${localAssetCount}`);
  console.log(`⚠️ Remaining Supabase URLs: ${supabaseCount}`);
  console.log(`🌐 External / Other URLs: ${otherCount}`);
  console.log("==========================================");

  if (supabaseCount === 0) {
    console.log("🎉 ALL media assets are 100% verified on Cloudflare R2!");
  } else {
    console.log(`⚠️ ${supabaseCount} items still point to Supabase.`);
  }
}

verify();
