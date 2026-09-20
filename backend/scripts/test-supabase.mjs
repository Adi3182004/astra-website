import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oriibywxfetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("Testing Supabase connection...");
  
  // 1. Check or create 'media' bucket
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    console.error("Storage list error:", bucketsErr.message);
  } else {
    console.log("Buckets found:", buckets.map((b) => b.name));
    const mediaExists = buckets.some((b) => b.name === "media");
    if (!mediaExists) {
      console.log("Creating 'media' bucket...");
      const { data: created, error: createErr } = await supabase.storage.createBucket("media", {
        public: true,
      });
      if (createErr) console.error("Create bucket error:", createErr.message);
      else console.log("Created media bucket successfully:", created);
    }
  }
}

main().catch(console.error);
