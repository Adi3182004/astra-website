import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProductsWithImages } from "@/lib/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { ProductFilters, applyFilters, DEFAULT_FILTERS, type FilterState } from "@/components/shop/ProductFilters";
import { useSeo, collectionJsonLd } from "@/lib/seo";
import { usePreviewDraft, normalizeProductDrafts } from "@/lib/previewDraft";
import { useSiteSettings } from "@/lib/settings";

import { styleToCss, type StyleMap } from "@/lib/textStyles";

export default function CategoryPage() {
  const { slug } = useParams();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { data: settings } = useSiteSettings();
  const mergeCategories = usePreviewDraft("categories");

  const { data: catRaw } = useQuery({
    queryKey: ["cat", slug],
    enabled: !!slug,
    queryFn: async () => (await supabase.from("categories").select("*").eq("slug", slug!).maybeSingle()).data,
  });
  const cat = mergeCategories(catRaw ? [catRaw as any] : [])[0] as any;

  const { data } = useQuery({
    queryKey: ["products", "cat", slug],
    enabled: !!slug,
    queryFn: () => fetchProductsWithImages({ categorySlug: slug }),
  });

  const mergeProducts = usePreviewDraft("products");
  const items = normalizeProductDrafts(mergeProducts(data as any[])) as NonNullable<typeof data>;
  const shown = applyFilters(items, filters);
  const name = cat?.name ?? "Category";
  const catTextStyle = (cat?.text_style ?? {}) as StyleMap;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useSeo({
    title: `${name} — Handcrafted Jewellery | PRIORA by KP`,
    description: `Shop handcrafted ${name.toLowerCase()} from PRIORA by KP. Elegant everyday designs, filterable by price and availability.`,
    canonicalPath: `/category/${slug ?? ""}`,
    image: items[0]?.image ?? cat?.image_url ?? null,
    jsonLd: collectionJsonLd(name, `${origin}/category/${slug ?? ""}`, shown.map((p) => ({ name: p.name, url: `${origin}/product/${p.slug}` }))),
  });

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <Link to="/shop" className="text-[11px] uppercase tracking-widest text-muted-foreground">← Shop All</Link>
      <h1 className="font-serif text-3xl md:text-4xl mt-2 mb-4" style={styleToCss(catTextStyle.name)}>{name}</h1>

      <ProductFilters
        items={items}
        value={filters}
        onChange={setFilters}
        count={shown.length}
        config={(settings?.theme as any)?.filter_config}
      />

      <div data-preview="products" className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
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
      {data && shown.length === 0 && <p className="text-center text-muted-foreground py-16">No pieces match those filters.</p>}
    </div>
  );
}
