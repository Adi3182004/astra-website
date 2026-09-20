import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Shield,
  Pencil,
  Trash2,
  KeyRound,
  UserPlus,
  Users,
  Search,
  Check,
  X,
  Mail,
  User,
  Lock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type StaffUser = {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  providers: string[];
  created_at: string;
  last_sign_in_at?: string;
};

export default function AdminStaff() {
  const qc = useQueryClient();
  const { user: currentAdmin } = useAuth();

  const [tab, setTab] = useState<"staff" | "customers">("staff");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  // Modal / Form state for Add User
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "editor" | "user",
  });

  // Modal state for Edit User
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", email: "", role: "admin" });

  // Modal state for Change Password
  const [passUser, setPassUser] = useState<StaffUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Fetch all users via backend API
  const { data: users = [], isLoading } = useQuery<StaffUser[]>({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin-users?action=list");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load users");
      return json.users;
    },
  });

  const staffUsers = users.filter((u) => u.roles.includes("admin") || u.roles.includes("editor"));
  const customerUsers = users.filter((u) => !u.roles.includes("admin") && !u.roles.includes("editor"));

  const currentList = tab === "staff" ? staffUsers : customerUsers;
  const filteredList = currentList.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  // 1. Create New User/Admin
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.email || !addForm.password) {
      return toast.error("Email and password are required");
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          email: addForm.email.trim(),
          password: addForm.password.trim(),
          full_name: addForm.full_name.trim(),
          role: addForm.role,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      toast.success(`Account created! ${addForm.email} now has instant ${addForm.role} access.`);
      setShowAddModal(false);
      setAddForm({ full_name: "", email: "", password: "", role: "admin" });
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setBusy(false);
    }
  }

  // 2. Update Profile & Role
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: editingUser.id,
          full_name: editForm.full_name.trim(),
          email: editForm.email.trim(),
          role: editForm.role,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      toast.success("User profile & permissions updated!");
      setEditingUser(null);
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setBusy(false);
    }
  }

  // 3. Direct Password Change
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passUser || !newPassword.trim()) {
      return toast.error("Please enter a new password");
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: passUser.id,
          password: newPassword.trim(),
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      toast.success(`Password updated for ${passUser.email}!`);
      setPassUser(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setBusy(false);
    }
  }

  // 4. Delete / Revoke Access
  async function handleDelete(u: StaffUser) {
    if (u.id === currentAdmin?.id) {
      return toast.error("You cannot delete your own active admin account!");
    }
    const confirmed = window.confirm(
      `Are you sure you want to completely remove ${u.email}? They will immediately lose all access to the system.`
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: u.id }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      toast.success(`Access completely revoked for ${u.email}`);
      qc.invalidateQueries({ queryKey: ["admin-users-list"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full bg-secondary/60 rounded-xl px-4 py-2.5 text-sm outline-none border border-border/40 focus:border-accent";

  return (
    <div className="max-w-4xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl mb-1">Staff & User Authority</h1>
          <p className="text-xs text-muted-foreground">
            Manage admin accounts, edit credentials, change passwords, and grant real-time access.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium shadow-md hover:opacity-95 active:scale-95 transition-all"
        >
          <UserPlus size={15} />
          <span>Add Admin / User</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex p-1 rounded-2xl bg-secondary/50 border border-border/50 max-w-xs">
          <button
            onClick={() => setTab("staff")}
            className={`flex-1 py-1.5 px-4 rounded-xl text-xs font-medium transition-all ${
              tab === "staff"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Admins & Staff ({staffUsers.length})
          </button>
          <button
            onClick={() => setTab("customers")}
            className={`flex-1 py-1.5 px-4 rounded-xl text-xs font-medium transition-all ${
              tab === "customers"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Customers ({customerUsers.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-secondary/40 rounded-full pl-9 pr-4 py-2 text-xs outline-none border border-border/40 focus:border-accent"
          />
        </div>
      </div>

      {/* User Cards List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">Loading accounts...</div>
      ) : filteredList.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground glass-card rounded-2xl">
          No {tab === "staff" ? "staff members" : "customers"} found.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredList.map((u) => {
            const isAdmin = u.roles.includes("admin");
            const isEditor = u.roles.includes("editor");
            const isSelf = u.id === currentAdmin?.id;

            return (
              <div
                key={u.id}
                className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/60 hover:border-accent/40 transition-colors shadow-sm"
              >
                {/* User Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-bold shadow-inner ${
                      isAdmin
                        ? "bg-accent/20 text-accent border border-accent/40"
                        : "bg-secondary text-foreground/80 border border-border"
                    }`}
                  >
                    {u.full_name?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {u.full_name || "Unnamed User"}
                      </p>
                      {isSelf && (
                        <span className="bg-primary/20 text-foreground text-[9px] px-2 py-0.5 rounded-full font-medium">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                          isAdmin
                            ? "bg-accent/15 text-accent border border-accent/30"
                            : isEditor
                            ? "bg-blue-500/15 text-blue-700 border border-blue-500/30"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isAdmin ? "Admin" : isEditor ? "Editor" : "Customer"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        via {u.providers.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-1.5 self-end md:self-center">
                  {/* Change Password Button */}
                  <button
                    onClick={() => {
                      setPassUser(u);
                      setNewPassword("");
                    }}
                    title="Change Password"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-secondary/60 hover:bg-secondary text-foreground/80 transition-colors border border-border/40"
                  >
                    <KeyRound size={13} className="text-accent" />
                    <span>Password</span>
                  </button>

                  {/* Edit Profile & Role Button */}
                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setEditForm({
                        full_name: u.full_name,
                        email: u.email,
                        role: isAdmin ? "admin" : isEditor ? "editor" : "user",
                      });
                    }}
                    title="Edit Name & Role"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-secondary/60 hover:bg-secondary text-foreground/80 transition-colors border border-border/40"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>

                  {/* Delete / Revoke Access */}
                  {!isSelf && (
                    <button
                      onClick={() => handleDelete(u)}
                      title="Revoke & Delete Access"
                      className="p-2 rounded-lg text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD NEW USER / ADMIN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-accent" />
                <h2 className="font-serif text-xl font-medium">Create New Account</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                  Full Name
                </label>
                <input
                  required
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="admin@priorabykp.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                  Access Level
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="admin">Admin — Full System Authority</option>
                  <option value="editor">Editor — Products & Media Content</option>
                  <option value="user">Customer — Storefront Access</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-border text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 py-2.5 rounded-full bg-accent text-accent-foreground text-xs uppercase tracking-wider font-semibold shadow-md disabled:opacity-50"
                >
                  {busy ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER DETAILS & ROLE */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Pencil size={18} className="text-accent" />
                <h2 className="font-serif text-xl font-medium">Edit User Profile</h2>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                  Full Name
                </label>
                <input
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                  Role Authority
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="admin">Admin — Full System Authority</option>
                  <option value="editor">Editor — Products & Media Content</option>
                  <option value="user">Customer — Regular Buyer Account</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-full border border-border text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 py-2.5 rounded-full bg-accent text-accent-foreground text-xs uppercase tracking-wider font-semibold shadow-md disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DIRECT PASSWORD RESET */}
      {passUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-background rounded-3xl p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-accent" />
                <h2 className="font-serif text-xl font-medium">Change Password</h2>
              </div>
              <button onClick={() => setPassUser(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Set a new instant password for <strong>{passUser.email}</strong>. They will be able to log in immediately with this new password.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className={inputClass}
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPassUser(null)}
                  className="flex-1 py-2.5 rounded-full border border-border text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 py-2.5 rounded-full bg-accent text-accent-foreground text-xs uppercase tracking-wider font-semibold shadow-md disabled:opacity-50"
                >
                  {busy ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
