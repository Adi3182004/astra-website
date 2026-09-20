import { useQuery } from "@tanstack/react-query";
import { fetchProductsWithImages } from "@/lib/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ProductFilters, applyFilters, DEFAULT_FILTERS, type FilterState } from "@/components/shop/ProductFilters";
import { useSeo, collectionJsonLd } from "@/lib/seo";
import { usePreviewDraft, normalizeProductDrafts } from "@/lib/previewDraft";
import { useSiteSettings } from "@/lib/settings";

export default function Shop() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { data: settings } = useSiteSettings();
  const { data } = useQuery({ queryKey: ["products", "shop"], queryFn: () => fetchProductsWithImages() });
  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").eq("is_active", true).order("sort_order")).data ?? [],
  });

  const mergeProducts = usePreviewDraft("products");
  const items = normalizeProductDrafts(mergeProducts(data as any[])) as NonNullable<typeof data>;
  const shown = applyFilters(items, filters);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useSeo({
    title: "Shop All Jewellery — PRIORA by KP",
    description:
      "Browse every PRIORA by KP piece: rings, earrings, bracelets and necklaces, handcrafted for everyday elegance. Filter by price and availability.",
    canonicalPath: "/shop",
    image: items[0]?.image ?? null,
    jsonLd: collectionJsonLd(
      "Shop All Jewellery",
      `${origin}/shop`,
      shown.map((p) => ({ name: p.name, url: `${origin}/product/${p.slug}` })),
    ),
  });

  return (
    <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <h1 className="font-serif text-3xl md:text-4xl mb-4">Shop All</h1>
      <nav aria-label="Categories" className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <Link to="/shop" className="px-4 py-1.5 bg-accent text-accent-foreground rounded-full text-[11px] uppercase tracking-widest whitespace-nowrap">All</Link>
        {cats?.map((c) => (
          <Link key={c.id} to={`/category/${c.slug}`} className="px-4 py-1.5 bg-secondary text-foreground rounded-full text-[11px] uppercase tracking-widest whitespace-nowrap">
            {c.name}
          </Link>
        ))}
      </nav>

      <ProductFilters
        items={items}
        value={filters}
        onChange={setFilters}
        count={shown.length}
        config={(settings?.theme as any)?.filter_config}
      />

      <div data-preview="products" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
        {!data ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-2xl aspect-[4/5] bg-secondary/50 border border-border/60 animate-pulse flex flex-col justify-end p-3.5 space-y-2.5">
              <div className="w-3/4 h-4 bg-secondary/80 rounded" />
              <div className="w-1/2 h-3.5 bg-secondary/80 rounded" />
              <div className="w-full h-8 bg-secondary/80 rounded-full mt-2" />
            </div>
          ))
        ) : (
          shown.map((p) => <div key={p.id} data-preview-item={p.id} className="h-full flex flex-col"><ProductCard p={p} /></div>)
        )}
      </div>
      {data && shown.length === 0 && <p className="text-center text-muted-foreground py-16">Nothing matches those filters.</p>}
    </div>
  );
}
