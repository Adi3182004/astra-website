import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { deleteRecord } from "@/lib/audit";
import { deleteProductMediaFiles } from "@/lib/media";
import { PreviewButton } from "@/components/admin/PreviewButton";
import { useMemo, useState } from "react";
import { Plus, Trash2, Edit, Search, X, Heart, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/settings";
import ProductForm from "./AdminProductForm";
import { ArrangeManager, type ArrangeItem } from "@/components/admin/ArrangeManager";

/** Availability buckets an admin actually thinks in. */
const STOCK_FILTERS = [
  { key: "all", label: "All" },
  { key: "in", label: "In stock" },
  { key: "low", label: "Low (≤5)" },
  { key: "out", label: "Out of stock" },
] as const;

const VISIBILITY_FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "hidden", label: "Hidden" },
  { key: "featured", label: "Featured" },
] as const;

const SORTS = [
  { key: "sequence", label: "Store Sequence (Saved Order)" },
  { key: "newest", label: "Newest first" },
  { key: "liked", label: "Most liked" },
  { key: "price_desc", label: "Price: high → low" },
  { key: "price_asc", label: "Price: low → high" },
  { key: "stock_asc", label: "Stock: low → high" },
  { key: "name", label: "Name A → Z" },
] as const;

export default function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [isArrangeOpen, setIsArrangeOpen] = useState(false);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState<(typeof STOCK_FILTERS)[number]["key"]>("all");
  const [visibility, setVisibility] = useState<(typeof VISIBILITY_FILTERS)[number]["key"]>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("sequence");

  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*, categories(name), product_images(url,sort_order)").order("sort_order", { ascending: true })).data ?? [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: async () => (await supabase.from("categories").select("id,name").order("sort_order")).data ?? [],
  });

  /** Wishlist counts power the "most liked" sort and the little heart badge. */
  const { data: likes = {} } = useQuery({
    queryKey: ["admin-product-likes"],
    queryFn: async () => {
      const { data } = await supabase.from("wishlists").select("product_id");
      const map: Record<string, number> = {};
      for (const r of (data ?? []) as any[]) map[r.product_id] = (map[r.product_id] ?? 0) + 1;
      return map;
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      // 1. Find product data before deletion to retrieve associated media and slug
      const targetProduct = (data ?? []).find((p: any) => p.id === id);
      const productImages = targetProduct?.product_images ?? [];
      const hoverImg = targetProduct?.text_style?.hover_image_url;
      const videoUrl = targetProduct?.video_url;

      // 2. Automatically delete all product images and storage files across all buckets
      const extraUrls = [hoverImg, videoUrl, ...productImages.map((img: any) => img.url)].filter(Boolean);
      await deleteProductMediaFiles(id, targetProduct?.slug, extraUrls);

      // 3. Delete wishlists & reviews rows for this product
      await Promise.allSettled([
        supabase.from("wishlists").delete().eq("product_id", id),
        supabase.from("reviews").delete().eq("product_id", id),
      ]);

      // 4. Delete the product record itself with audit log
      return (await deleteRecord({ table: "products", id, label: targetProduct?.name })).error;
    },
    onSuccess: (err) => {
      if (err) { toast.error(err.message); return; }
      toast.success("Product & all associated media deleted successfully");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
      qc.invalidateQueries({ queryKey: ["admin-product-likes"] });
    },
  });

  const arrangeItems: ArrangeItem[] = useMemo(() => {
    return (data ?? []).map((p: any) => {
      const imgs = (p.product_images ?? []).slice().sort((a: any, b: any) => a.sort_order - b.sort_order);
      return {
        id: p.id,
        name: p.name,
        sort_order: p.sort_order ?? 0,
        image: imgs[0]?.url ?? null,
        price: Number(p.price) || 0,
        categoryName: p.categories?.name ?? null,
        created_at: p.created_at,
      };
    });
  }, [data]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = (data ?? []).filter((p: any) => {
      if (term && !`${p.name} ${p.slug} ${p.categories?.name ?? ""}`.toLowerCase().includes(term)) return false;
      if (category !== "all" && p.category_id !== category) return false;
      const isOut = p.out_of_stock || p.stock <= 0;
      if (stock === "out" && !isOut) return false;
      if (stock === "in" && isOut) return false;
      if (stock === "low" && (isOut || p.stock > 5)) return false;
      if (visibility === "live" && !p.is_active) return false;
      if (visibility === "hidden" && p.is_active) return false;
      if (visibility === "featured" && !p.is_featured) return false;
      return true;
    });

    const by: Record<string, (a: any, b: any) => number> = {
      sequence: (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      newest: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      liked: (a, b) => (likes[b.id] ?? 0) - (likes[a.id] ?? 0),
      price_desc: (a, b) => b.price - a.price,
      price_asc: (a, b) => a.price - b.price,
      stock_asc: (a, b) => a.stock - b.stock,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(by[sort]);
  }, [data, q, category, stock, visibility, sort, likes]);

  const total = (data ?? []).length;
  const outCount = (data ?? []).filter((p: any) => p.out_of_stock || p.stock <= 0).length;
  const hiddenCount = (data ?? []).filter((p: any) => !p.is_active).length;

  if (creating || editing) {
    return <ProductForm id={editing ?? undefined} onDone={() => { setCreating(false); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["products"] }); }} />;
  }

  const chip = "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest whitespace-nowrap";
  const active = "bg-accent text-accent-foreground";
  const idle = "bg-secondary";
  const filtersOn = q || category !== "all" || stock !== "all" || visibility !== "all" || sort !== "sequence";

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-[11px] text-muted-foreground mt-1">
            {total} total · {outCount} out of stock · {hiddenCount} hidden
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsArrangeOpen(true)}
            className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all"
            title="Arrange product display sequence"
          >
            <ArrowUpDown size={14} className="text-accent" /> Arrange
          </button>
          <button onClick={() => setCreating(true)} className="flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold shadow hover:opacity-90 transition-all">
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <ArrangeManager
        isOpen={isArrangeOpen}
        onClose={() => setIsArrangeOpen(false)}
        title="Arrange Product Sequence"
        tableName="products"
        items={arrangeItems}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin-products"] });
          qc.invalidateQueries({ queryKey: ["products"] });
        }}
      />

      {/* Filter toolbar */}
      <div className="glass-card rounded-2xl p-3 mb-4 space-y-2" data-tour="products-filter">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by product, slug or category…"
            className="w-full rounded-full border border-border bg-background pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button onClick={() => setCategory("all")} className={`${chip} ${category === "all" ? active : idle}`}>All categories</button>
          {(categories as any[]).map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={`${chip} ${category === c.id ? active : idle}`}>{c.name}</button>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {STOCK_FILTERS.map((s) => (
            <button key={s.key} onClick={() => setStock(s.key)} className={`${chip} ${stock === s.key ? active : idle}`}>{s.label}</button>
          ))}
          <span className="w-px bg-border mx-1 shrink-0" />
          {VISIBILITY_FILTERS.map((v) => (
            <button key={v.key} onClick={() => setVisibility(v.key)} className={`${chip} ${visibility === v.key ? active : idle}`}>{v.label}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px]"
          >
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <span className="text-[11px] text-muted-foreground">{rows.length} shown</span>
          {filtersOn && (
            <button
              onClick={() => { setQ(""); setCategory("all"); setStock("all"); setVisibility("all"); setSort("newest"); }}
              className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((p: any, idx: number) => {
          const imgs = (p.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
          const img = imgs[0]?.url;
          const isOut = p.out_of_stock || p.stock <= 0;
          return (
            <div key={p.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
              {/* Sequence Position Number */}
              <span className="w-7 h-7 rounded-lg bg-secondary/80 text-muted-foreground font-mono text-xs font-bold flex items-center justify-center flex-shrink-0" title={`Sequence order: #${(p.sort_order ?? 0) + 1}`}>
                #{(p.sort_order ?? idx) + 1}
              </span>

              {img ? (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {imgs.length > 1 && (
                    <span className="absolute bottom-0.5 right-0.5 bg-background/80 text-[8px] font-mono px-1 py-0.2 rounded">
                      {imgs.length} imgs
                    </span>
                  )}
                </div>
              ) : null}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.categories?.name ?? "—"} · {formatPrice(p.price)} · Stock {p.stock}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {(() => {
                    const occKey = p.text_style?.occasion || "daily";
                    const occMap: Record<string, { label: string; icon: string; style: string }> = {
                      daily: { label: "Daily Wear", icon: "✨", style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
                      office: { label: "Office Wear", icon: "💼", style: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
                      party: { label: "Party & Festive", icon: "🎉", style: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
                      wedding: { label: "Bridal & Wedding", icon: "👰", style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
                    };
                    const occ = occMap[occKey] || occMap.daily;
                    return (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium border ${occ.style}`} title={`Occasion: ${occ.label}`}>
                        {occ.icon} {occ.label}
                      </span>
                    );
                  })()}
                  {!p.is_active && <span className="text-[9px] bg-muted px-2 py-0.5 rounded-full">Hidden</span>}
                  {p.is_featured && <span className="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded-full">Featured</span>}
                  {isOut && <span className="text-[9px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Out of stock</span>}
                  {!isOut && p.stock <= 5 && <span className="text-[9px] bg-secondary px-2 py-0.5 rounded-full">Only {p.stock} left</span>}
                  {(likes as any)[p.id] > 0 && (
                    <span className="text-[9px] bg-secondary px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Heart size={9} /> {(likes as any)[p.id]}
                    </span>
                  )}
                </div>
              </div>
              <PreviewButton target="products" itemId={p.id} label="Preview" className="shrink-0" />
              <button onClick={() => setEditing(p.id)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer" title="Edit product"><Edit size={14} /></button>
              <button onClick={() => { if (confirm("Delete this product?")) del.mutate(p.id); }} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg cursor-pointer" title="Delete product"><Trash2 size={14} /></button>
            </div>
          );
        })}
        {!rows.length && (
          <p className="text-center text-xs text-muted-foreground py-10">
            No products match these filters.
          </p>
        )}
      </div>
    </div>
  );
}
