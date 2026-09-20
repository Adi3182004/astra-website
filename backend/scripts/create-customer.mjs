import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oriibywxhetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = "testbuyer@gmail.com";
  const password = "TestBuyer123!";

  console.log(`Creating customer user ${email}...`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Test Customer Buyer" },
  });

  if (error && !error.message.includes("already")) {
    console.error("Error:", error);
    return;
  }

  console.log("Customer account ready:", email);
  const { data: users } = await supabase.auth.admin.listUsers();
  const customer = users.users.find((u) => u.email === email);

  // Verify roles
  const { data: roles } = await supabase.from("user_roles").select("*").eq("user_id", customer.id);
  console.log("Customer roles in database:", roles);
}

main().catch(console.error);
