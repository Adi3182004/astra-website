import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
};

export function useProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return (data as Profile) ?? null;
    },
  });

  async function saveProfile(values: Partial<Profile>) {
    if (!user) return { error: new Error("Not signed in") };
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email ?? null, ...values })
      .eq("id", user.id);
    if (!error) qc.invalidateQueries({ queryKey: ["profile", user.id] });
    return { error };
  }

  return { ...query, profile: query.data ?? null, saveProfile };
}
