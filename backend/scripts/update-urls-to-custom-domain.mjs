import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env
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

const OLD_HOST = "pub-dcd7a358fb574745aa0887a6d68b20e7.r2.dev";
const NEW_HOST = "media.priorabykp.co.in";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function switchHost(url) {
  if (!url || typeof url !== "string") return url;
  return url.replace(OLD_HOST, NEW_HOST);
}

async function run() {
  console.log(`🔄 Updating media URLs from '${OLD_HOST}' to '${NEW_HOST}'...\n`);

  // 1. product_images
  const { data: prodImgs } = await supabase.from("product_images").select("id, url");
  let prodImgCount = 0;
  for (const item of prodImgs || []) {
    if (item.url && item.url.includes(OLD_HOST)) {
      const newUrl = switchHost(item.url);
      await supabase.from("product_images").update({ url: newUrl }).eq("id", item.id);
      prodImgCount++;
    }
  }
  console.log(`✅ Updated ${prodImgCount} product_images.`);

  // 2. categories
  const { data: categories } = await supabase.from("categories").select("id, image_url, video_url");
  let catCount = 0;
  for (const item of categories || []) {
    const updates = {};
    if (item.image_url && item.image_url.includes(OLD_HOST)) {
      updates.image_url = switchHost(item.image_url);
    }
    if (item.video_url && item.video_url.includes(OLD_HOST)) {
      updates.video_url = switchHost(item.video_url);
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from("categories").update(updates).eq("id", item.id);
      catCount++;
    }
  }
  console.log(`✅ Updated ${catCount} categories.`);

  // 3. banners
  const { data: banners } = await supabase.from("banners").select("id, image_url, video_url");
  let bannerCount = 0;
  for (const item of banners || []) {
    const updates = {};
    if (item.image_url && item.image_url.includes(OLD_HOST)) {
      updates.image_url = switchHost(item.image_url);
    }
    if (item.video_url && item.video_url.includes(OLD_HOST)) {
      updates.video_url = switchHost(item.video_url);
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from("banners").update(updates).eq("id", item.id);
      bannerCount++;
    }
  }
  console.log(`✅ Updated ${bannerCount} banners.`);

  // 4. products (video_url)
  const { data: products } = await supabase.from("products").select("id, video_url");
  let prodCount = 0;
  for (const item of products || []) {
    if (item.video_url && item.video_url.includes(OLD_HOST)) {
      await supabase.from("products").update({ video_url: switchHost(item.video_url) }).eq("id", item.id);
      prodCount++;
    }
  }
  console.log(`✅ Updated ${prodCount} products.`);

  // 5. site_videos
  try {
    const { data: siteVideos } = await supabase.from("site_videos").select("id, video_url, poster_url");
    let videoCount = 0;
    for (const item of siteVideos || []) {
      const updates = {};
      if (item.video_url && item.video_url.includes(OLD_HOST)) {
        updates.video_url = switchHost(item.video_url);
      }
      if (item.poster_url && item.poster_url.includes(OLD_HOST)) {
        updates.poster_url = switchHost(item.poster_url);
      }
      if (Object.keys(updates).length > 0) {
        await supabase.from("site_videos").update(updates).eq("id", item.id);
        videoCount++;
      }
    }
    console.log(`✅ Updated ${videoCount} site_videos.`);
  } catch (e) {}

  console.log("\n🎉 All URLs successfully updated to custom domain media.priorabykp.co.in!");
}

run();
