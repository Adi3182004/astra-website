import { supabase } from "@/integrations/supabase/client";
import type { ProductCardData } from "@/components/product/ProductCard";

const FALLBACK = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80";

export async function fetchProductsWithImages(filter?: { categorySlug?: string; featured?: boolean }) {
  // A LEFT join on categories: a product must never disappear from the store
  // just because it has no category yet (or the admin is mid-edit on it).
  let q = supabase
    .from("products")
    .select(
      "id,name,slug,description,price,compare_at_price,is_featured,category_id,stock,out_of_stock,show_stock,stock_prefix,stock_suffix,text_style,product_images(url,sort_order),categories(slug,name)"
    )
    .eq("is_active", true)
    .order("sort_order");

  if (filter?.featured) q = q.eq("is_featured", true);
  if (filter?.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filter.categorySlug)
      .maybeSingle();
    // Unknown slug → no products, rather than silently listing the whole store.
    q = q.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000");
  }

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).map((p): ProductCardData => {
    const imgs = (p.product_images ?? []).slice().sort((a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0));
    const textStyle = (p as any).text_style || {};
    const hoverEnabled = !!textStyle.enable_hover_image;
    const explicitHoverUrl = textStyle.hover_image_url || null;
    const catName = Array.isArray((p as any).categories) ? (p as any).categories[0]?.name : (p as any).categories?.name;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? null,
      price: Number(p.price || 0),
      compare_at_price: p.compare_at_price != null ? Number(p.compare_at_price) : null,
      image: imgs[0]?.url ?? FALLBACK,
      hoverImage: hoverEnabled && explicitHoverUrl ? explicitHoverUrl : null,
      stock: p.stock ?? 0,
      out_of_stock: (p as any).out_of_stock ?? false,
      show_stock: p.show_stock ?? true,
      stock_prefix: p.stock_prefix ?? null,
      stock_suffix: p.stock_suffix ?? null,
      categoryName: catName ?? null,
      text_style: (p as any).text_style ?? {},
    };
  });
}

export function stockLabel(p: {
  stock: number;
  out_of_stock?: boolean;
  show_stock?: boolean;
  stock_prefix?: string | null;
  stock_suffix?: string | null;
}) {
  if (p.out_of_stock) return "Out of stock";
  if (p.stock <= 0) return "Sold out";

  const rawPrefix = (p.stock_prefix || "").trim();
  const rawSuffix = (p.stock_suffix || "").trim();

  // If show_stock is enabled in admin
  if (p.show_stock) {
    if (rawPrefix || rawSuffix) {
      // Clean string concatenation to avoid duplicate number occurrences
      const full = `${rawPrefix} ${p.stock} ${rawSuffix}`.replace(/\s+/g, " ").trim();
      // Deduplicate patterns like "1 1 left" or "1 One Piece Left"
      const cleaned = full
        .replace(/^1\s+(one\s+piece\s+left)/i, "1 piece left")
        .replace(/^1\s+(only\s+1\s+left)/i, "Only 1 left")
        .replace(/(\b\d+\b)\s+\1/gi, "$1");
      return cleaned;
    }
    return p.stock === 1 ? "Only 1 left" : p.stock <= 5 ? `Only ${p.stock} left` : `${p.stock} in stock`;
  }

  // If custom prefix/suffix provided without number
  if (rawPrefix || rawSuffix) {
    return `${rawPrefix} ${rawSuffix}`.replace(/\s+/g, " ").trim();
  }

  return null;
}
