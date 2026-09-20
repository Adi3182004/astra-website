// Query current RLS policies for orders table via Supabase service role
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oriibywxhetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: "public" }
});

// Use rpc to query pg_policies
const { data, error } = await supabase.rpc("exec_query", {
  query: "SELECT policyname, cmd, roles, with_check FROM pg_policies WHERE tablename = 'orders' ORDER BY policyname"
});

if (error) {
  console.log("rpc exec_query not available:", error.message);
  
  // Try direct REST query to information_schema
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/exec_query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ query: "SELECT policyname, cmd, roles, with_check FROM pg_policies WHERE tablename = 'orders' ORDER BY policyname" })
    }
  );
  console.log("Direct REST:", res.status, await res.text());
} else {
  console.log("Policies:", JSON.stringify(data, null, 2));
}

// Now try a simple test: create an order using the anon key (like a guest)
const ANON_KEY = "sb_publishable_Ku9PVVi8kpH_EJXVCiFWvw_OXeEZS0y";
const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log("\nTesting guest INSERT (anon key, user_id=null)...");
const { data: guestOrder, error: guestErr } = await anonClient
  .from("orders")
  .insert({
    user_id: null,
    contact_name: "Test Guest",
    phone: "9999999999",
    email: "guest@test.com",
    address: "Test Address",
    notes: "RLS Policy Test Guest - DELETE ME",
    subtotal: 1,
    status: "new",
    items: []
  })
  .select()
  .single();

if (guestErr) {
  console.log("❌ Guest INSERT failed:", guestErr.message, "code:", guestErr.code);
} else {
  console.log("✅ Guest INSERT succeeded! Order ID:", guestOrder.id);
  await supabase.from("orders").delete().eq("id", guestOrder.id);
}
