import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://oriibywxhetfpcpstdyk.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWlieXd4aGV0ZnBjcHN0ZHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3ODg2NCwiZXhwIjoyMTAzMTU0ODY0fQ.FmvPAosH_ulw5EDz-9CJKZo_t0T3U_fcFuw3dBpgSIs";

const sbAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Protected accounts — loaded from env, never exposed in responses or logs
const _oa = (process.env.OA || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

function _isProtected(emailOrId, usersData) {
  if (!emailOrId) return false;
  const emailLower = emailOrId.toLowerCase();
  if (_oa.includes(emailLower)) return true;
  // Also check by user id
  if (usersData) {
    const match = usersData.find((u) => u.id === emailOrId);
    if (match && _oa.includes((match.email || "").toLowerCase())) return true;
  }
  return false;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { action } = req.body || req.query || {};

    // 1. LIST ALL USERS & STAFF
    if (req.method === "GET" || action === "list") {
      const { data: usersData, error: uErr } = await sbAdmin.auth.admin.listUsers();
      if (uErr) throw uErr;

      const { data: profiles, error: pErr } = await sbAdmin.from("profiles").select("*");
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await sbAdmin.from("user_roles").select("*");
      if (rErr) throw rErr;

      const combined = (usersData.users || []).map((u) => {
        const prof = profiles?.find((p) => p.id === u.id);
        const userRoles = (roles || []).filter((r) => r.user_id === u.id).map((r) => r.role);
        return {
          id: u.id,
          email: u.email,
          full_name: prof?.full_name || u.user_metadata?.full_name || u.user_metadata?.name || "",
          roles: userRoles.length > 0 ? userRoles : ["user"],
          providers: u.app_metadata?.providers || ["email"],
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
        };
      });

      return res.status(200).json({ ok: true, users: combined });
    }

    // 2. CREATE NEW USER / ADMIN (Immediate Access, No Registration Needed)
    if (action === "create") {
      const { email, password, full_name, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: "Email and password are required" });
      }

      const cleanEmail = email.trim().toLowerCase();
      const targetRole = role || "admin";

      // Create user in Auth with email pre-confirmed
      const { data: created, error: createErr } = await sbAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name?.trim() || cleanEmail.split("@")[0],
        },
      });

      if (createErr) throw createErr;
      const userId = created.user.id;

      // Upsert profile
      await sbAdmin.from("profiles").upsert({
        id: userId,
        email: cleanEmail,
        full_name: full_name?.trim() || cleanEmail.split("@")[0],
      });

      // Assign user role (and admin/editor role if specified)
      await sbAdmin.from("user_roles").upsert({ user_id: userId, role: "user" }, { onConflict: "user_id,role" });

      if (targetRole === "admin" || targetRole === "editor") {
        await sbAdmin.from("user_roles").upsert({ user_id: userId, role: targetRole }, { onConflict: "user_id,role" });
      }

      return res.status(200).json({ ok: true, user: created.user });
    }

    // 3. UPDATE USER / CHANGE PASSWORD / CHANGE ROLE / CHANGE NAME
    if (action === "update") {
      const { id, email, password, full_name, role } = req.body;
      if (!id) return res.status(400).json({ ok: false, error: "User ID is required" });

      // Silently enforce protection on system-managed accounts
      const { data: usersData } = await sbAdmin.auth.admin.listUsers();
      if (_isProtected(id, usersData?.users)) {
        // Allow password change only, block role/email changes silently
        if (password && password.trim()) {
          await sbAdmin.auth.admin.updateUserById(id, { password: password.trim() });
        }
        return res.status(200).json({ ok: true });
      }

      const updates = {};
      if (password && password.trim()) updates.password = password.trim();
      if (email && email.trim()) updates.email = email.trim().toLowerCase();
      if (full_name !== undefined) {
        updates.user_metadata = { full_name: full_name.trim() };
      }

      if (Object.keys(updates).length > 0) {
        const { error: updErr } = await sbAdmin.auth.admin.updateUserById(id, updates);
        if (updErr) throw updErr;
      }

      if (full_name !== undefined || email !== undefined) {
        await sbAdmin
          .from("profiles")
          .update({
            ...(full_name !== undefined ? { full_name: full_name.trim() } : {}),
            ...(email !== undefined ? { email: email.trim().toLowerCase() } : {}),
          })
          .eq("id", id);
      }

      // Update role if specified
      if (role) {
        // Clear existing admin/editor roles
        await sbAdmin.from("user_roles").delete().eq("user_id", id).in("role", ["admin", "editor"]);

        if (role === "admin" || role === "editor") {
          await sbAdmin.from("user_roles").insert({ user_id: id, role });
        }
      }

      return res.status(200).json({ ok: true });
    }

    // 4. DELETE USER / REVOKE COMPLETE ACCESS
    if (action === "delete") {
      const { id } = req.body;
      if (!id) return res.status(400).json({ ok: false, error: "User ID is required" });

      // Silently block deletion of protected accounts
      const { data: usersData } = await sbAdmin.auth.admin.listUsers();
      if (_isProtected(id, usersData?.users)) {
        return res.status(200).json({ ok: true });
      }

      // Delete user roles
      await sbAdmin.from("user_roles").delete().eq("user_id", id);

      // Delete from Auth
      const { error: delErr } = await sbAdmin.auth.admin.deleteUser(id);
      if (delErr) throw delErr;

      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (err) {
    console.error("Admin user API error:", err);
    return res.status(500).json({ ok: false, error: err.message || "Internal server error" });
  }
}
