// Apply orders RLS fix using Supabase Management API
// Uses the project's service role JWT for authentication

const SUPABASE_URL = "https://oriibywxhetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";
const PROJECT_REF = "oriibywxhetfpcpstdyk";

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

// Try Supabase pg-meta endpoint
const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
  method: "HEAD",
  headers: {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  },
});
console.log("API reachable:", res.status, res.statusText);

// Use supabase-js client's .rpc to execute SQL via a function
// We can create and execute a temporary function

import { createClient } from "@supabase/supabase-js";
const { createClient: cc } = await import("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Execute each statement separately using the Postgres HTTP API
// Supabase exposes /rest/v1/rpc/<function> for calling SQL functions
// Let's try executing via the Supabase DB API if available

// Try the /sql endpoint (new Supabase feature)
const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
  method: "GET",
  headers: {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  },
});

const text = await sqlRes.text();
console.log("REST root:", text.substring(0, 200));
