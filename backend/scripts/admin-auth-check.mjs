import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oriibywxhetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Checking Supabase Auth users...");
  const { data: usersData, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error("List users error:", usersErr);
    return;
  }
  console.log("Existing users count:", usersData.users.length);
  for (const u of usersData.users) {
    console.log(`- ${u.email} (${u.id}) confirmed: ${u.email_confirmed_at != null}`);
  }

  // Check roles
  const { data: roles, error: rolesErr } = await supabase.from("user_roles").select("*");
  console.log("Roles table:", roles, rolesErr);

  // Check profiles
  const { data: profiles, error: profilesErr } = await supabase.from("profiles").select("*");
  console.log("Profiles table:", profiles, profilesErr);
}

main().catch(console.error);
