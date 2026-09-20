import { useWishlist } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product/ProductCard";
import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";
import { useSeo, collectionJsonLd } from "@/lib/seo";

export default function Wishlist() {
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const { data } = useQuery({
    queryKey: ["wishlist-products", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,price,compare_at_price,stock,out_of_stock,show_stock,stock_prefix,stock_suffix,product_images(url,sort_order)")
        .in("id", ids);
      return (data ?? []).map((p: any) => ({
        id: p.id, name: p.name, slug: p.slug,
        price: Number(p.price),
        compare_at_price: p.compare_at_price != null ? Number(p.compare_at_price) : null,
        stock: Number(p.stock ?? 0),
        out_of_stock: !!p.out_of_stock,
        show_stock: !!p.show_stock,
        stock_prefix: p.stock_prefix,
        stock_suffix: p.stock_suffix,
        image: (p.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url ?? "",
        image2: (p.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order)[1]?.url ?? "",
      }));
    },
  });

  const items = data ?? [];
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useSeo({
    title: "Your Wishlist — Saved Jewellery | PRIORA by KP",
    description:
      "Your saved PRIORA by KP pieces in one place. Revisit the rings, earrings, bracelets and necklaces you love and add them to your bag when you're ready.",
    canonicalPath: "/wishlist",
    image: items[0]?.image ?? null,
    jsonLd: collectionJsonLd(
      "Your Wishlist",
      `${origin}/wishlist`,
      items.map((p) => ({ name: p.name, url: `${origin}/product/${p.slug}` })),
    ),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-serif text-3xl md:text-4xl mb-6">Your Wishlist</h1>
      {ids.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto mb-4 text-muted-foreground" size={40} />
          <p className="text-sm text-muted-foreground mb-4">Save pieces you love here.</p>
          <Link to="/shop" className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-full text-xs uppercase tracking-widest">Explore</Link>
        </div>
      ) : (
        <div data-preview="products" className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {items.map((p) => (
            <div key={p.id} data-preview-item={p.id} className="relative h-full flex flex-col">
              <ProductCard p={p as any} />
              <button
                onClick={() => toggle(p.id)}
                aria-label={`Remove ${p.name} from wishlist`}
                className="absolute top-2 right-2 z-10 rounded-full bg-background/85 backdrop-blur p-1.5 border border-border text-muted-foreground hover:text-accent"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
