import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/store";

export type CartAvailability = {
  unavailable: { id: string; name: string }[];
  hasUnavailable: boolean;
  isLoading: boolean;
};

/**
 * Live availability guard: watches every product in the bag and drops items the
 * moment an admin marks them out of stock (or stock hits zero).
 */
export function useCartStockGuard(autoRemove = true): CartAvailability {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const ids = items.map((i) => i.productId).sort();

  const { data, isLoading } = useQuery({
    queryKey: ["cart-availability", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,stock,out_of_stock,is_active")
        .in("id", ids);
      if (error) throw error;
      return data ?? [];
    },
  });

  const unavailable = (data ?? [])
    .filter((p: any) => p.out_of_stock || !p.is_active || Number(p.stock) <= 0)
    .map((p: any) => ({ id: p.id as string, name: p.name as string }));

  useEffect(() => {
    if (!autoRemove || unavailable.length === 0) return;
    unavailable.forEach((p) => {
      remove(p.id);
      toast.error(`${p.name} just went out of stock and was removed from your bag`);
    });
  }, [autoRemove, unavailable.map((u) => u.id).join(","), remove]);

  return { unavailable, hasUnavailable: unavailable.length > 0, isLoading };
}
