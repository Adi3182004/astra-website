import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, MASTER_ADMIN_EMAIL } from "./useAuth";

export type StaffRole = "admin" | "editor" | "user";

/** Roles for the signed-in user. Admin implies full access, editor is content-only. */
export function useRoles() {
  const { user } = useAuth();
  const isMaster = user?.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase();

  const { data, isLoading } = useQuery({
    queryKey: ["role", user?.id],
    enabled: !!user && !isMaster,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      return (data ?? []).map((r) => r.role as StaffRole);
    },
  });

  const roles = isMaster ? (["admin" as StaffRole]) : data ?? [];
  const isAdmin = isMaster || roles.includes("admin");
  const isEditor = isMaster || roles.includes("editor");
  return { roles, isAdmin, isEditor, isStaff: isAdmin || isEditor, loading: isLoading, user };
}

export function useIsAdmin() {
  const { isAdmin, user } = useRoles();
  return { isAdmin, user };
}
