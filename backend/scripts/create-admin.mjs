import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oriibywxhetfpcpstdyk.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdmin() {
  const adminEmail = "priorabykp@gmail.com";
  const adminPassword = "Priora@Admin2024!";

  console.log(`Setting up admin user for ${adminEmail}...`);

  // 1. Create or get user
  const { data: userData, error: userErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: "PRIORA Admin" },
  });

  let userId;
  if (userErr) {
    if (userErr.message.includes("already")) {
      console.log("User already exists, updating password and confirming email...");
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list.users.find((u) => u.email === adminEmail);
      userId = existing.id;
      await supabase.auth.admin.updateUserById(userId, {
        password: adminPassword,
        email_confirm: true,
      });
    } else {
      console.error("Create user error:", userErr);
      return;
    }
  } else {
    userId = userData.user.id;
    console.log("User created successfully with ID:", userId);
  }

  // 2. Ensure profile exists
  const { error: profErr } = await supabase.from("profiles").upsert({
    id: userId,
    email: adminEmail,
    full_name: "PRIORA Admin",
  });
  console.log("Profile upsert:", profErr ? profErr.message : "Success");

  // 3. Ensure admin role exists
  const { error: roleErr } = await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role: "admin",
    },
    { onConflict: "user_id,role" }
  );
  console.log("Admin role upsert:", roleErr ? roleErr.message : "Success");

  // Verify
  const { data: roles } = await supabase.from("user_roles").select("*").eq("user_id", userId);
  console.log("Verified roles for user:", roles);
}

createAdmin().catch(console.error);
