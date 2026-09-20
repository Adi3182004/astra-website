import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oriibywxhetfpcpstdyk.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const sb = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log("=== Verifying & Finalizing Cloud-Ready Architecture ===");

// 1. Check & Create all Storage Buckets
const requiredBuckets = ["public-assets", "product-media", "banners", "videos"];

console.log("\n--- Checking Storage Buckets ---");
const { data: buckets, error: bErr } = await sb.storage.listBuckets();
if (bErr) console.error("Error listing buckets:", bErr);

const existingBucketNames = (buckets || []).map((b) => b.name);
console.log("Existing Buckets:", existingBucketNames);

for (const bName of requiredBuckets) {
  if (!existingBucketNames.includes(bName)) {
    console.log(`Creating public storage bucket: ${bName}...`);
    const { error: createErr } = await sb.storage.createBucket(bName, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });
    if (createErr) console.error(`Failed to create bucket ${bName}:`, createErr.message);
    else console.log(`Bucket ${bName} created successfully!`);
  } else {
    console.log(`Bucket '${bName}' exists and is ready.`);
  }
}

// 2. Check all Database Tables
const requiredTables = [
  "profiles",
  "user_roles",
  "wishlists",
  "abandoned_carts",
  "orders",
  "order_items",
  "products",
  "categories",
  "reviews",
  "banners",
  "videos",
  "site_settings",
  "info_pages",
  "media",
];

console.log("\n--- Checking Database Tables ---");
const tableStatus = {};
for (const table of requiredTables) {
  const { data, error, count } = await sb
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) {
    tableStatus[table] = `MISSING / ERROR: ${error.message}`;
  } else {
    tableStatus[table] = `READY (Row count: ${count ?? 0})`;
  }
}

console.table(tableStatus);

// 3. Final summary of architecture verification
console.log("\nArchitecture verification complete.");
