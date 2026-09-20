// Apply orders RLS fix via Supabase pg-meta query endpoint
const PROJECT_REF = "oriibywxhetfpcpstdyk";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const queries = [
  `DROP POLICY IF EXISTS "insert order any" ON public.orders`,
  `DROP POLICY IF EXISTS "guest can insert order" ON public.orders`,
  `DROP POLICY IF EXISTS "user can insert own order" ON public.orders`,
  `CREATE POLICY "guest can insert order" ON public.orders FOR INSERT TO anon WITH CHECK (user_id IS NULL)`,
  `CREATE POLICY "user can insert own order" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL)`,
  `GRANT INSERT ON public.orders TO anon`,
  `GRANT INSERT ON public.orders TO authenticated`,
];

// Supabase pg-meta endpoint for executing queries
const PG_META_URL = `https://${PROJECT_REF}.supabase.co/pg-meta/v0/query`;

for (const query of queries) {
  console.log(`Running: ${query.substring(0, 60)}...`);
  
  try {
    const res = await fetch(PG_META_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      console.log(`  ❌ Failed (${res.status}):`, data.error || JSON.stringify(data).substring(0, 100));
    } else {
      console.log(`  ✅ Success`);
    }
  } catch (err) {
    console.log(`  ❌ Error:`, err.message);
  }
}

console.log("\nDone! Check current policies:");

// Check policies now
const policyRes = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/`, {
  headers: { "Authorization": `Bearer ${SERVICE_ROLE_KEY}`, "apikey": SERVICE_ROLE_KEY }
});
console.log("REST status:", policyRes.status);
