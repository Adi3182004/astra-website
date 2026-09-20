import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });
}

export function formatPrice(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return `₹${v.toLocaleString("en-IN")}`;
}
