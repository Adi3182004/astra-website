import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oriibywxhetfpcpstdyk.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Use Supabase Management API to run SQL
const projectRef = "oriibywxhetfpcpstdyk";

const sql = `
DROP POLICY IF EXISTS "insert order any" ON public.orders;
DROP POLICY IF EXISTS "guest can insert order" ON public.orders;
DROP POLICY IF EXISTS "user can insert own order" ON public.orders;

CREATE POLICY "guest can insert order" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "user can insert own order" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.orders TO authenticated;
`;

try {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  
  if (!res.ok) {
    console.log("exec_sql not available, trying via pg-meta...");
    
    // Try via Supabase pg-meta API
    const res2 = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    
    const data2 = await res2.json();
    console.log("Response:", JSON.stringify(data2, null, 2));
  } else {
    const data = await res.json();
    console.log("✅ SQL executed:", JSON.stringify(data, null, 2));
  }
} catch (err) {
  console.error("Error:", err.message);
}
