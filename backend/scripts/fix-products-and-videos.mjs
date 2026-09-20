import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

let supabaseUrl = "https://oriibywxhetfpcpstdyk.supabase.co";
let serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const sb = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log("Checking products...");
  const { data: products } = await sb.from("products").select("id, name, slug, is_active");
  console.log("Products count:", products?.length);
  for (const p of products || []) {
    console.log(`- ${p.name} (${p.slug}) [active: ${p.is_active}]`);
    if (p.slug === "adi" || p.name.toLowerCase().includes("adi")) {
      console.log("Found dummy product 'adi'. Deleting...");
      await sb.from("products").delete().eq("id", p.id);
      console.log("Deleted product 'adi'.");
    }
  }

  console.log("\nChecking site_videos...");
  const { data: videos } = await sb.from("site_videos").select("*");
  console.log("Site videos count:", videos?.length);
  console.log(videos);

  // If no site_videos exist or inactive, insert/update active film
  if (!videos || videos.length === 0) {
    console.log("Inserting default Atelier film into site_videos...");
    const { data: inserted, error } = await sb.from("site_videos").insert({
      title: "The Atelier Film",
      subtitle: "Handcrafted with passion & precision",
      video_url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-jeweler-crafting-a-ring-41584-large.mp4",
      poster_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
      is_active: true,
      sort_order: 0,
    }).select();
    console.log("Inserted video:", inserted, error);
  }
}

main().catch(console.error);
