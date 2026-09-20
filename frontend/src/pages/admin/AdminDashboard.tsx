import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, Layers, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/settings";

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, c, o] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("subtotal,status,created_at"),
      ]);
      const orders = o.data ?? [];
      const revenue = orders.filter(x => x.status !== "cancelled").reduce((a, x) => a + Number(x.subtotal), 0);
      return { products: p.count ?? 0, categories: c.count ?? 0, orders: orders.length, revenue, recent: orders.slice(0, 5) };
    },
  });

  const cards = [
    { icon: Package, label: "Products", value: data?.products ?? 0 },
    { icon: Layers, label: "Categories", value: data?.categories ?? 0 },
    { icon: ShoppingBag, label: "Orders", value: data?.orders ?? 0 },
    { icon: TrendingUp, label: "Revenue", value: formatPrice(data?.revenue ?? 0) },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="glass-card rounded-2xl p-4">
            <c.icon className="text-accent mb-2" size={20} />
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{c.label}</p>
            <p className="font-serif text-xl mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
