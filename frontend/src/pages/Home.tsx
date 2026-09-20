import { useQuery } from "@tanstack/react-query";
import { usePreviewDraft } from "@/lib/previewDraft";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { isVideoUrl } from "@/lib/media";
import { SmartMedia } from "@/components/media/SmartMedia";
import { ChevronRight, Sparkles, Truck, Shield, RefreshCw } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { fetchProductsWithImages } from "@/lib/queries";
import { useEffect, useState } from "react";
import { ForEveryYou } from "@/components/home/ForEveryYou";
import { VideoSection } from "@/components/home/VideoSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { T } from "@/components/SlotText";
import { styleToCss, type StyleMap } from "@/lib/textStyles";
import { useSeo } from "@/lib/seo";

/**
 * The hero slide title. The first slide is the page's single <h1>; every
 * other slide renders an <h2> so the document keeps exactly one top heading.
 */
function HeroHeading({
  level,
  children,
  ...rest
}: { level: 1 | 2; children: React.ReactNode } & React.ComponentProps<typeof motion.h1>) {
  const Tag = level === 1 ? motion.h1 : motion.h2;
  return <Tag {...rest}>{children}</Tag>;
}

function HomeSkeleton() {
  return (
    <div className="space-y-10 sm:space-y-14 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="relative h-[62vh] max-h-[560px] bg-secondary/50 w-full overflow-hidden flex flex-col items-center justify-end pb-14 px-6 border-b border-border/40">
        <div className="w-56 h-8 bg-secondary/80 rounded-xl mb-3" />
        <div className="w-36 h-4 bg-secondary/80 rounded-lg mb-5" />
        <div className="w-32 h-10 bg-secondary/90 rounded-full" />
      </div>

      {/* Announcement Strip Skeleton */}
      <div className="h-10 bg-accent/10 border-y border-border/50" />

      {/* Categories Skeleton */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-5">
          <div className="w-44 h-8 bg-secondary/70 rounded-xl" />
          <div className="w-16 h-4 bg-secondary/70 rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl aspect-square bg-secondary/50 border border-border/60" />
          ))}
        </div>
      </div>

      {/* Bestsellers Skeleton */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-5">
          <div className="w-36 h-8 bg-secondary/70 rounded-xl" />
          <div className="w-16 h-4 bg-secondary/70 rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl aspect-[4/5] bg-secondary/50 border border-border/60 flex flex-col justify-end p-3.5 space-y-2.5">
              <div className="w-3/4 h-4 bg-secondary/80 rounded" />
              <div className="w-1/2 h-3.5 bg-secondary/80 rounded" />
              <div className="w-full h-8 bg-secondary/80 rounded-full mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* New Arrivals Skeleton */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="w-40 h-8 bg-secondary/70 rounded-xl mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl aspect-[4/5] bg-secondary/50 border border-border/60 flex flex-col justify-end p-3.5 space-y-2.5">
              <div className="w-3/4 h-4 bg-secondary/80 rounded" />
              <div className="w-1/2 h-3.5 bg-secondary/80 rounded" />
              <div className="w-full h-8 bg-secondary/80 rounded-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const mergeBanners = usePreviewDraft("banners");
  const mergeCategories = usePreviewDraft("categories");
  const { data: bannersRaw, isLoading: bannersLoading } = useQuery({
    queryKey: ["banners", "hero"],
    queryFn: async () => {
      const { data } = await supabase.from("banners").select("*").eq("is_active", true).eq("position", "hero").order("sort_order");
      return data ?? [];
    },
  });
  const { data: stripRaw } = useQuery({
    queryKey: ["banners", "strip"],
    queryFn: async () => {
      const { data } = await supabase.from("banners").select("*").eq("is_active", true).eq("position", "strip").order("sort_order");
      return data ?? [];
    },
  });
  const { data: categoriesRaw, isLoading: catsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });
  const banners = mergeBanners(bannersRaw as any[]).filter((b: any) => (b.position ?? "hero") === "hero");
  const strip = mergeBanners(stripRaw as any[]).filter((b: any) => b.position === "strip");
  const categories = mergeCategories(categoriesRaw as any[]);

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => fetchProductsWithImages({ featured: true }),
  });
  const { data: all, isLoading: allLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => fetchProductsWithImages(),
  });

  const isInitialLoading =
    (!bannersRaw && bannersLoading) ||
    (!categoriesRaw && catsLoading) ||
    (!featured && featuredLoading) ||
    (!all && allLoading);

  // Hero carousel
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!banners?.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners]);

  useSeo({
    title: "PRIORA by KP — Jewellery that reflects your Aura",
    description:
      "Discover PRIORA by KP: handcrafted earrings, rings, necklaces and bracelets. Jewellery that reflects your aura. Free shipping above Rs.999.",
    image: banners?.[0]?.image_url ?? null,
    canonicalPath: "/",
  });

  if (isInitialLoading) {
    return <HomeSkeleton />;
  }

  const bestsellerProducts = (featured && featured.length > 0)
    ? featured
    : (all && all.length > 0 ? all.slice(0, 4) : []);

  const displayNewArrivals = (all && all.length > 0)
    ? (bestsellerProducts.length > 0
        ? all.filter((p) => !bestsellerProducts.some((bp) => bp.id === p.id)).slice(0, 8)
        : all.slice(0, 8))
    : [];

  const finalNewArrivals = displayNewArrivals.length > 0 ? displayNewArrivals : (all?.slice(0, 8) ?? []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-10 sm:space-y-14"
    >
      {/* Hero carousel */}
      <section data-preview="banners" className="relative h-[62vh] max-h-[560px] overflow-hidden">
        {banners?.map((b, i) => (
          <motion.div
            key={b.id}
            initial={false}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0"
            data-preview-item={b.id}
            style={{ pointerEvents: i === idx ? "auto" : "none" }}
          >
            {(b as any).video_url || isVideoUrl(b.image_url) ? (
              <video
                src={(b as any).video_url || b.image_url}
                poster={(b as any).video_url ? b.image_url : undefined}
                className="w-full h-full object-cover"
                muted playsInline autoPlay loop preload="metadata"
              />
            ) : b.image_url ? (
              <img src={b.image_url} alt={b.title ?? ""} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-champagne/70 via-background to-champagne/40" />
            )}
            <div className="absolute inset-0 media-scrim" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-6 text-center on-media">
              {/* Only the first slide carries the page h1 — the rest are h2 so
                  the document always has exactly one top-level heading. */}
              <HeroHeading
                level={i === 0 ? 1 : 2}
                key={b.id + idx}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="font-serif text-4xl md:text-6xl leading-tight max-w-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                style={styleToCss(((b as any).text_style as StyleMap)?.title)}
              >
                {b.title}
              </HeroHeading>
              {b.subtitle && (
                <p
                  className="text-sm md:text-base tracking-wide mt-3 text-white/95 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-w-xl"
                  style={styleToCss(((b as any).text_style as StyleMap)?.subtitle)}
                >
                  {b.subtitle}
                </p>
              )}
              {b.cta_label && b.cta_link && (
                <Link
                  to={b.cta_link}
                  className="mt-6 inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-3 rounded-full text-xs font-semibold tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
                  style={styleToCss(((b as any).text_style as StyleMap)?.cta)}
                >
                  <span>{b.cta_label}</span>
                </Link>
              )}
            </div>
          </motion.div>
        ))}
        {/* Pagination Dots with Accessible Touch Targets */}
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-10">
          {banners?.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="p-1.5 focus:outline-none transition-all group"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 shadow-sm ${
                  i === idx
                    ? "w-8 bg-accent"
                    : "w-2.5 bg-white/60 hover:bg-white/90 group-hover:w-4"
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Announcement strip */}
      {strip && strip.length > 0 && (
        <div className="bg-accent/10 border-y border-border/50 overflow-hidden">
          <div className="flex animate-[shimmer_20s_linear_infinite] gap-12 py-2.5 whitespace-nowrap">
            {[...strip, ...strip, ...strip].map((s, i) => (
              <span key={i} className="text-xs tracking-wider font-medium text-foreground/80 flex items-center gap-2">
                <Sparkles size={12} className="text-accent" /> {s.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <section data-preview="categories" className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-5">
          <T k="home.categories.title" as="h2" className="font-serif text-2xl md:text-3xl" />
          <Link
            to="/shop"
            className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/15 transition-all"
          >
            <span><T k="home.categories.link" /></span>
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories?.map((c) => (
            <Link key={c.id} data-preview-item={c.id} to={`/category/${c.slug}`} className="group relative rounded-2xl overflow-hidden aspect-square glass-card shadow-xs hover:shadow-md transition-shadow">
              <SmartMedia
                src={c.image_url}
                videoSrc={(c as any).video_url}
                alt=""
                ratio="aspect-square"
                rounded="rounded-2xl"
                fallbackLabel={c.name}
                className="group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 media-scrim" />
              <span className="absolute bottom-3 left-3 font-serif text-lg on-media drop-shadow-sm" style={styleToCss(((c as any).text_style as StyleMap)?.name)}>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellerProducts.length > 0 && (
        <section data-preview="products" className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-5">
            <T k="home.bestsellers.title" as="h2" className="font-serif text-2xl md:text-3xl" />
            <Link
              to="/shop"
              className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/15 transition-all"
            >
              <span><T k="home.bestsellers.link" /></span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {bestsellerProducts.map((p) => (
              <div key={p.id} data-preview-item={p.id} className="h-full flex flex-col"><ProductCard p={p} /></div>
            ))}
          </div>
        </section>
      )}

      <ForEveryYou />
      <div data-preview="videos"><VideoSection /></div>
      <div data-preview="reviews"><ReviewsSection /></div>

      {/* New Arrivals / All products */}
      {finalNewArrivals.length > 0 && (
        <section className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between mb-5">
            <T k="home.newArrivals.title" as="h2" className="font-serif text-2xl md:text-3xl" />
            <Link
              to="/shop"
              className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/15 transition-all"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {finalNewArrivals.map((p) => (
              <div key={p.id} data-preview-item={p.id} className="h-full flex flex-col"><ProductCard p={p} /></div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3 rounded-full text-xs font-semibold tracking-wider hover:opacity-90 shadow-md transition-all active:scale-[0.99]"
            >
              <T k="home.shopAll.button" />
            </Link>
          </div>
        </section>
      )}
    </motion.div>
  );
}
