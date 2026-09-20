import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oriibywxhetfpcpstdyk.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const sb = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const adminEmails = ["priorabykp@gmail.com", "kshitijdevadiga03@gmail.com"];
const adminPassword = "31082004";

console.log("=== Setting up Admin Accounts ===");

for (const email of adminEmails) {
  // Check if user exists
  const { data: usersData, error: listErr } = await sb.auth.admin.listUsers();
  if (listErr) throw listErr;

  let existingUser = usersData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  let userId;

  if (existingUser) {
    console.log(`Updating existing user: ${email} (${existingUser.id})`);
    const { data: updated, error: updateErr } = await sb.auth.admin.updateUserById(
      existingUser.id,
      {
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          ...existingUser.user_metadata,
          full_name: email === "priorabykp@gmail.com" ? "PRIORA Admin" : "Kshitij Devadiga",
        },
      }
    );
    if (updateErr) console.error(`Error updating ${email}:`, updateErr);
    else console.log(`Password set to '${adminPassword}' for ${email}`);
    userId = existingUser.id;
  } else {
    console.log(`Creating new user: ${email}`);
    const { data: created, error: createErr } = await sb.auth.admin.createUser({
      email,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: email === "priorabykp@gmail.com" ? "PRIORA Admin" : "Kshitij Devadiga",
      },
    });
    if (createErr) throw createErr;
    console.log(`Created user ${email} with ID: ${created.user.id}`);
    userId = created.user.id;
  }

  // Ensure admin role in user_roles
  const { data: existingRoles, error: rolesErr } = await sb
    .from("user_roles")
    .select("*")
    .eq("user_id", userId);

  if (rolesErr) console.error("Error checking roles:", rolesErr);

  const hasAdmin = existingRoles?.some((r) => r.role === "admin");
  if (!hasAdmin) {
    console.log(`Assigning admin role to ${email}...`);
    const { error: insertErr } = await sb
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (insertErr) console.error("Insert role error:", insertErr);
    else console.log(`Admin role successfully assigned to ${email}!`);
  } else {
    console.log(`${email} already has admin role.`);
  }
}

// Check final roles
const { data: finalRoles } = await sb.from("user_roles").select("*");
console.log("\nAll User Roles in Database:");
console.table(finalRoles);
