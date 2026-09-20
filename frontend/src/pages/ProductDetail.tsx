import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Package,
  RotateCcw,
  ChevronDown,
  Share2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
import { formatPrice } from "@/lib/settings";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SmartMedia } from "@/components/media/SmartMedia";
import { useSeo, productJsonLd } from "@/lib/seo";
import { styleToCss } from "@/lib/textStyles";
import { readDraft, inPreview } from "@/lib/previewDraft";
import { fetchRecommendationConfig } from "@/lib/recommendations";
import { DealsSection } from "@/components/product/DealsSection";
import { useIsAdmin } from "@/hooks/useUserRole";
import { getProductSizeLabel } from "@/lib/productSize";

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { isAdmin } = useIsAdmin();
  const showAdminImageBadges = isAdmin || inPreview();
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "care" | "shipping">("description");
  const [shareOpen, setShareOpen] = useState(false);
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const cartItems = useCart((s) => s.items);
  const wish = useWishlist();

  // Touch swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const { data: rawProduct, isLoading } = useQuery({
    queryKey: ["product", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url,sort_order), categories(name,slug)")
        .eq("slug", slug!)
        .maybeSingle();
      return data;
    },
  });

  // Fetch reviews for this product
  const { data: reviews } = useQuery({
    queryKey: ["product-reviews", rawProduct?.id],
    enabled: !!rawProduct?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  // Fetch related products (checks product-specific recommendations first, then falls back to same category)
  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", rawProduct?.category_id, rawProduct?.id],
    enabled: !!rawProduct?.id,
    queryFn: async () => {
      if (!rawProduct) return [];
      try {
        const recConfig = await fetchRecommendationConfig();
        const assignedIds = recConfig.productRules?.[rawProduct.id];

        if (Array.isArray(assignedIds) && assignedIds.length > 0) {
          const { data } = await supabase
            .from("products")
            .select("id,name,slug,price,original_price,compare_at_price,stock,out_of_stock,product_images(url,sort_order)")
            .in("id", assignedIds)
            .eq("is_active", true);

          if (data && data.length > 0) {
            return data;
          }
        }
      } catch (e) {
        console.error("Error fetching recommendation rules:", e);
      }

      if (!rawProduct.category_id) return [];
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,price,original_price,compare_at_price,stock,out_of_stock,product_images(url,sort_order)")
        .eq("category_id", rawProduct.category_id)
        .eq("is_active", true)
        .neq("id", rawProduct.id)
        .order("sort_order")
        .limit(6);
      return data ?? [];
    },
  });

  // Merge preview draft when in admin preview mode
  const [p, setP] = useState<typeof rawProduct>(rawProduct);
  useEffect(() => {
    if (rawProduct) {
      if (inPreview()) {
        const draft = readDraft();
        if (draft && draft.table === "products" && (draft.id === rawProduct.id || !draft.id)) {
          const merged = { ...rawProduct, ...draft.values };
          setP(merged as typeof rawProduct);
          return;
        }
      }
      setP(rawProduct);
    }
  }, [rawProduct]);

  // Also listen for live draft updates via BroadcastChannel
  useEffect(() => {
    if (!inPreview()) return;
    const ch = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("priora-preview-draft") : null;
    if (!ch) return;
    ch.addEventListener("message", (e) => {
      const draft = e.data;
      if (draft && draft.table === "products" && rawProduct) {
        setP({ ...rawProduct, ...draft.values } as typeof rawProduct);
      } else if (!draft && rawProduct) {
        setP(rawProduct);
      }
    });
    return () => ch.close();
  }, [rawProduct]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const rawImages = ((p?.product_images ?? []) as any[]).slice().sort((a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0));
  const textStyle = (p as any)?.text_style || {};
  const hoverEnabled = !!textStyle.enable_hover_image;
  const hoverUrl = textStyle.hover_image_url as string | null;

  const images = [...rawImages];
  if (hoverEnabled && hoverUrl && !images.some((im) => im.url === hoverUrl)) {
    images.push({ url: hoverUrl, sort_order: 9999, isHover: true });
  }

  const rawSeoImage: string | null = images[0]?.url ?? null;
  const seoImage = rawSeoImage
    ? rawSeoImage.startsWith("http")
      ? rawSeoImage
      : `${origin}${rawSeoImage.startsWith("/") ? "" : "/"}${rawSeoImage}`
    : null;
  const seoUrl = `${origin}/product/${p?.slug ?? ""}`;
  const seoSoldOut = !!(p as any)?.out_of_stock || Number(p?.stock ?? 0) <= 0;

  useSeo({
    title: p ? `${p.name} — PRIORA by KP` : "Loading… — PRIORA by KP",
    description: p?.description ?? "Handcrafted jewellery by PRIORA by KP.",
    image: seoImage,
    canonicalPath: `/product/${slug ?? ""}`,
    type: "product",
    noIndex: !p,
    jsonLd: p
      ? productJsonLd({
          name: p.name,
          description: p.description,
          image: seoImage,
          price: Number(p.price),
          inStock: !seoSoldOut,
          url: seoUrl,
          category: (p as any).categories?.name ?? null,
        })
      : null,
  });

  if (isLoading)
    return (
      <div className="p-16 text-center">
        <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Loading product details…</p>
      </div>
    );
  if (!p)
    return (
      <div className="p-16 text-center">
        Product not found.{" "}
        <Link to="/shop" className="underline text-accent">
          Back to shop
        </Link>
      </div>
    );

  const currentImg = images[imgIdx]?.url ?? "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800";
  const discount =
    p.compare_at_price && Number(p.compare_at_price) > Number(p.price)
      ? Math.round(((Number(p.compare_at_price) - Number(p.price)) / Number(p.compare_at_price)) * 100)
      : 0;
  const hasWish = wish.has(p.id);
  const cartItem = cartItems.find((i) => i.productId === p?.id);
  const qtyInCart = cartItem?.qty ?? 0;
  const availableStock = Number(p?.stock ?? 0);
  const soldOut = !p || !!(p as any).out_of_stock || availableStock <= 0;
  const productVideo = (p as any).video_url as string | null;

  const avgRating = reviews?.length
    ? reviews.reduce((s: number, r: any) => s + (r.rating ?? 5), 0) / reviews.length
    : 0;

  const handleAdd = () => {
    if (soldOut || availableStock <= 0) {
      toast.error("This product is currently out of stock");
      return false;
    }
    if (qtyInCart + qty > availableStock) {
      toast.error(
        `Only ${availableStock} item${availableStock > 1 ? "s" : ""} available in stock${
          qtyInCart > 0 ? ` (${qtyInCart} already in bag)` : ""
        }`
      );
      return false;
    }
    add({ productId: p.id, name: p.name, price: Number(p.price), image: currentImg, slug: p.slug, stock: availableStock }, qty);
    openDrawer();
    return true;
  };

  const handleBuyNow = () => {
    if (soldOut || availableStock <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }
    if (qtyInCart === 0) {
      add({ productId: p.id, name: p.name, price: Number(p.price), image: currentImg, slug: p.slug, stock: availableStock }, 1);
    }
    openDrawer();
  };

  const prevImage = () => {
    if (images.length <= 1) return;
    setImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    if (images.length <= 1) return;
    setImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) nextImage();
    if (touchStartX.current - touchEndX.current < -50) prevImage();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: p.name, url: seoUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(seoUrl);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="pb-24 md:pb-12">
      {/* ── Luxury Breadcrumb Navigation Bar with Back Button ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3.5 pb-2.5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Elegant Back Button */}
          <button
            type="button"
            onClick={() => nav(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-card/80 border border-rose-200/70 dark:border-rose-900/40 text-foreground/80 hover:text-accent hover:border-accent/60 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 text-xs font-medium tracking-wide shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
            title="Go back"
          >
            <ArrowLeft size={13} strokeWidth={2.2} className="text-accent" />
            <span>Back</span>
          </button>

          {/* Breadcrumb Path */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto scrollbar-hide py-0.5">
            <Link
              to="/"
              className="hover:text-accent transition-colors font-medium hover:underline underline-offset-4 shrink-0"
            >
              Home
            </Link>

            <ChevronRight size={12} className="text-rose-300 dark:text-rose-800 shrink-0" />

            <Link
              to="/shop"
              className="hover:text-accent transition-colors font-medium hover:underline underline-offset-4 shrink-0"
            >
              Shop
            </Link>

            {(() => {
              const cat = Array.isArray((p as any).categories) ? (p as any).categories[0] : (p as any).categories;
              if (!cat || !cat.slug) return null;
              return (
                <>
                  <ChevronRight size={12} className="text-rose-300 dark:text-rose-800 shrink-0" />
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-accent transition-colors font-medium hover:underline underline-offset-4 shrink-0 text-foreground/85"
                  >
                    {cat.name}
                  </Link>
                </>
              );
            })()}

            <ChevronRight size={12} className="text-rose-300 dark:text-rose-800 shrink-0" />

            <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-xs shrink-0">
              {p.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-[1fr_480px] lg:grid-cols-[1fr_520px] 2xl:grid-cols-[1fr_560px] md:gap-10 lg:gap-14">

          {/* ── LEFT: Image Gallery ── */}
          <div className="md:sticky md:top-20 md:self-start">
            {/* Main Image */}
            <div
              className="relative w-full aspect-[4/5] bg-secondary/20 rounded-2xl md:rounded-3xl overflow-hidden group select-none flex items-center justify-center shadow-xs"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImg}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  src={currentImg}
                  alt={p.name}
                  className={`absolute inset-0 w-full h-full object-cover ${
                    soldOut ? "blur-[3px] saturate-50" : ""
                  }`}
                />
              </AnimatePresence>

              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow">
                  -{discount}% OFF
                </span>
              )}

              {images.length > 1 && (
                <span className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm text-[11px] font-mono px-2.5 py-1 rounded-full text-foreground shadow">
                  {imgIdx + 1} / {images.length}
                </span>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background text-foreground p-2 rounded-full shadow transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background text-foreground p-2 rounded-full shadow transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {soldOut && (
                <div className="absolute inset-0 flex items-center justify-center oos-overlay backdrop-blur-[3px] md:rounded-2xl">
                  <span className="oos-badge -rotate-[18deg] font-serif tracking-[0.3em] text-lg uppercase px-7 py-2.5 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Mobile dots */}
            {images.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-3 md:hidden">
                {images.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imgIdx ? "w-6 bg-accent" : "w-1.5 bg-border hover:bg-muted-foreground"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail Rail */}
            {images.length > 1 && (
              <div className="flex gap-2.5 p-2 mt-3 overflow-x-auto scrollbar-hide">
                {images.map((im: any, i: number) => {
                  const isHoverShot = (hoverEnabled && im.url === hoverUrl) || im.isHover;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImgIdx(i)}
                      className={`relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all flex items-center justify-center bg-secondary/30 ${
                        i === imgIdx
                          ? "border-accent ring-2 ring-accent/30 scale-105"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={im.url} alt="" className="w-full h-full object-cover" />
                      {showAdminImageBadges && i === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-accent text-accent-foreground text-[7px] uppercase font-bold text-center py-0.5">
                          Main
                        </span>
                      )}
                      {showAdminImageBadges && isHoverShot && (
                        <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-white text-[7px] uppercase font-bold text-center py-0.5">
                          Hover
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Video */}
            {productVideo && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-accent" />
                  <span>Product Video Preview</span>
                </p>
                <SmartMedia videoSrc={productVideo} thumbnail ratio="aspect-video" alt={`${p.name} video`} />
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="pt-5 md:pt-0">
            {/* Category pill */}
            {p.categories && (
              <Link
                to={`/category/${(p as any).categories.slug}`}
                className="inline-block text-[10px] uppercase tracking-[0.25em] text-accent font-semibold bg-accent/10 px-3 py-1 rounded-full hover:bg-accent/20 transition-colors mb-3"
              >
                {(p as any).categories.name}
              </Link>
            )}

            {/* Product Name */}
            <h1
              className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight text-foreground"
              style={styleToCss(textStyle.name)}
            >
              {p.name}
            </h1>

            {/* Rating strip */}
            {(() => {
              const customRating = textStyle?.rating_info;
              const isRatingVisible = customRating ? customRating.show_rating !== false : true;
              if (!isRatingVisible) return null;

              const ratingNum = customRating?.rating_value != null
                ? Number(customRating.rating_value)
                : (avgRating > 0 ? avgRating : 4.8);
              const countNum = customRating?.review_count != null
                ? Number(customRating.review_count)
                : (reviews && reviews.length > 0 ? reviews.length : 5);

              return (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= Math.round(ratingNum) ? "fill-amber-400 text-amber-400" : "text-border"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {ratingNum.toFixed(1)} ({countNum} {countNum === 1 ? "review" : "reviews"})
                  </span>
                </div>
              );
            })()}

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mt-4 flex-wrap">
              <span
                className="text-2xl md:text-3xl font-bold text-foreground tracking-tight"
                style={styleToCss(textStyle.price)}
              >
                {formatPrice(p.price)}
              </span>
              {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                <span className="text-sm md:text-base text-muted-foreground/75 line-through font-normal">
                  {formatPrice(p.compare_at_price)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs bg-accent/15 text-accent font-bold px-2.5 py-1 rounded-full border border-accent/20">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Stock badge */}
            {!soldOut && ((p as any).show_stock || (p as any).stock_prefix || (p as any).stock_suffix) && (
              <p
                className="mt-2 text-xs text-muted-foreground"
                style={styleToCss(textStyle.stock)}
              >
                {(p as any).stock_prefix && <span>{(p as any).stock_prefix} </span>}
                {(p as any).show_stock ? (
                  (p as any).stock_suffix ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {p.stock} {(p as any).stock_suffix}
                    </span>
                  ) : Number(p.stock) <= 5 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Only {p.stock} left — order soon!
                    </span>
                  ) : (
                    <span>In stock ({p.stock} available)</span>
                  )
                ) : (
                  (p as any).stock_suffix && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      {(p as any).stock_suffix}
                    </span>
                  )
                )}
              </p>
            )}
            {soldOut && (
              <p className="mt-2 text-xs font-semibold text-red-500" style={styleToCss(textStyle.stock)}>
                Currently out of stock
              </p>
            )}

            {/* Deals Section (Palmonas Style) */}
            <DealsSection productPrice={Number(p.price)} />

            {/* In stock - ready to ship status */}
            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full border border-emerald-600 flex items-center justify-center">
                <Check size={11} strokeWidth={3} />
              </span>
              <span>{!soldOut ? "In stock — ready to ship" : "Currently out of stock"}</span>
            </div>

            {/* Size & Dimensions Specification Pill */}
            <div className="flex items-center gap-2 mt-3.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/80 border border-border/80 text-xs text-foreground">
                <span className="text-muted-foreground font-medium">Size:</span>
                <span className="font-semibold text-accent">{getProductSizeLabel(p)}</span>
              </div>
              <span className="text-[11px] text-muted-foreground bg-accent/5 px-2.5 py-1 rounded-lg border border-accent/15">
                ✨ {textStyle?.size_info?.mode === "custom" ? "Handcrafted Dimensions" : "Universal Fit"}
              </span>
            </div>

            {/* Desktop & Mobile Action Area (Palmonas Style) */}
            <div className="mt-6 space-y-2.5">
              {/* Row 1: Shaking ADD TO CART + Wishlist */}
              <div className="flex items-center gap-2.5">
                <button
                  disabled={soldOut}
                  onClick={handleAdd}
                  className="animate-cart-shake flex-1 py-3.5 px-6 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all disabled:opacity-40 disabled:animation-none flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <ShoppingBag size={15} />
                  <span>{soldOut ? "Out of Stock" : "ADD TO CART"}</span>
                  <ArrowRight size={14} className="ml-1" />
                </button>

                <button
                  type="button"
                  onClick={() => wish.toggle(p.id)}
                  className="w-12 h-12 rounded-xl border border-border/80 bg-white dark:bg-secondary/40 hover:bg-secondary flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                  aria-label="Add to wishlist"
                >
                  <Heart size={18} className={hasWish ? "fill-accent text-accent" : "text-foreground"} />
                </button>
              </div>

              {/* Row 2: Full Width BUY IT NOW Button */}
              <button
                disabled={soldOut}
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-xl bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold hover:opacity-95 shadow-md transition-all disabled:opacity-40 active:scale-[0.99] cursor-pointer"
              >
                {soldOut ? "Sold Out" : "BUY IT NOW"}
              </button>
            </div>



            <div className="h-px bg-border/60 my-5" />

            {/* Info Accordion Tabs */}
            <div className="space-y-0">
              {[
                { id: "description" as const, label: "Description", icon: Package },
                { id: "care" as const, label: "Care & Details", icon: Sparkles },
                { id: "shipping" as const, label: "Shipping & Returns", icon: Truck },
              ].map(({ id, label, icon: Icon }) => (
                <div key={id} className="border-b border-border/50 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === id ? "description" : id)}
                    className="w-full flex items-center justify-between py-3.5 text-left text-sm font-medium hover:text-accent transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} className="text-accent" />
                      {label}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-muted-foreground transition-transform ${
                        activeTab === id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeTab === id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4">
                          {id === "description" && (
                            <p
                              className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
                              style={styleToCss(textStyle.description)}
                            >
                              {p.description || "No description available."}
                            </p>
                          )}
                          {id === "care" && (
                            <div className="space-y-3">
                              <div className="p-3 bg-secondary/40 rounded-xl border border-border/50 text-xs space-y-1">
                                <p className="font-semibold text-foreground flex items-center justify-between">
                                  <span>Product Sizing & Dimensions:</span>
                                  <span className="text-accent font-bold">{getProductSizeLabel(p)}</span>
                                </p>
                                <p className="text-muted-foreground text-[11px]">
                                  {textStyle?.size_info?.mode === "custom"
                                    ? "Precision measured for comfortable daily styling."
                                    : "Designed with an adjustable fit/extender chain to suit all standard sizes comfortably."}
                                </p>
                              </div>
                              <ul className="text-sm text-muted-foreground space-y-1.5 list-none">
                                <li className="flex items-start gap-2">
                                  <span className="text-accent mt-0.5">•</span>
                                  Handcrafted with 365-day anti-tarnish finish
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-accent mt-0.5">•</span>
                                  Avoid contact with water, perfume, and harsh chemicals
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-accent mt-0.5">•</span>
                                  Store in the provided pouch or jewellery box
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-accent mt-0.5">•</span>
                                  Wipe gently with a soft dry cloth to restore shine
                                </li>
                              </ul>
                            </div>
                          )}
                          {id === "shipping" && (
                            <div className="space-y-3 text-sm text-muted-foreground">
                              <div className="flex items-start gap-2.5">
                                <Truck size={15} className="text-accent mt-0.5 shrink-0" />
                                <div>
                                  <p className="font-semibold text-foreground text-xs">Free Shipping</p>
                                  <p className="text-xs">On all orders</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <Package size={15} className="text-accent mt-0.5 shrink-0" />
                                <div>
                                  <p className="font-semibold text-foreground text-xs">Standard Delivery</p>
                                  <p className="text-xs">3–7 business days</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <RotateCcw size={15} className="text-accent mt-0.5 shrink-0" />
                                <div>
                                  <p className="font-semibold text-foreground text-xs">Returns</p>
                                  <p className="text-xs leading-relaxed">No returns unless a clear, continuous unboxing video is available, with no cuts or edits.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews && reviews.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 pt-8 border-t border-border/60">
          <h2 className="font-serif text-2xl mb-5">Customer Reviews</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.slice(0, 4).map((r: any) => (
              <div key={r.id} className="glass-card rounded-2xl p-4 border border-border/60 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{r.author || "Anonymous"}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={11}
                          className={s <= (r.rating ?? 5) ? "fill-amber-400 text-amber-400" : "text-border"}
                        />
                      ))}
                    </div>
                  </div>
                  {r.body && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{r.body}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related / Recommended Products (Swipeable Format) */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 pt-8 border-t border-border/60">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-foreground font-medium flex items-center gap-2">
                <Sparkles size={20} className="text-accent" /> Complete The Look &amp; Recommendations
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Handpicked handcrafted pairings for this piece</p>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline-block">
              Swipe to explore →
            </span>
          </div>

          <div className="flex gap-3.5 overflow-x-auto scrollbar-hide py-2 px-0.5 select-none items-stretch">
            {relatedProducts.map((rp: any) => {
              const imgs = (rp.product_images ?? []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
              const rpSoldOut = !!rp.out_of_stock || Number(rp.stock ?? 0) <= 0;
              const originalPrice = Number(rp.original_price || rp.compare_at_price) || 0;
              const price = Number(rp.price) || 0;
              const discountPct = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

              return (
                <div
                  key={rp.id}
                  className="flex-shrink-0 w-[170px] sm:w-[210px] group glass-card rounded-2xl overflow-hidden border border-border/70 hover:border-accent/40 transition-all flex flex-col justify-between shadow-2xs h-full"
                >
                  <Link to={`/product/${rp.slug}`} className="block relative flex-1 flex flex-col justify-between">
                    <div>
                      <div className="aspect-[4/5] overflow-hidden bg-secondary/40 relative">
                        {imgs[0]?.url ? (
                          <img
                            src={imgs[0].url}
                            alt={rp.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary/50" />
                        )}
                        {discountPct > 0 && (
                          <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>

                      <div className="p-3 pb-2 min-h-[58px] flex flex-col justify-between">
                        <p className="text-xs font-serif font-medium line-clamp-1 text-foreground group-hover:text-accent transition-colors">
                          {rp.name}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{formatPrice(price)}</span>
                          {originalPrice > price && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>
                        {rpSoldOut && <p className="text-[10px] text-rose-500 font-medium mt-0.5">Out of stock</p>}
                      </div>
                    </div>
                  </Link>

                  <div className="p-3 pt-0 mt-auto">
                    <button
                      type="button"
                      disabled={rpSoldOut}
                      onClick={(e) => {
                        e.preventDefault();
                        if (rpSoldOut) return;
                        const rpStock = Number(rp.stock ?? 0);
                        const inCart = cartItems.find((ci) => ci.productId === rp.id)?.qty ?? 0;
                        if (rpStock > 0 && inCart >= rpStock) {
                          toast.error(`Only ${rpStock} available in stock`);
                          return;
                        }
                        add({
                          productId: rp.id,
                          name: rp.name,
                          price: price,
                          image: imgs[0]?.url || "",
                          slug: rp.slug,
                          stock: rpStock,
                        });
                        toast.success(`${rp.name} added to bag!`);
                      }}
                      className="w-full py-1.5 rounded-lg border border-foreground/80 hover:bg-foreground hover:text-background text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 active:scale-95"
                    >
                      <Plus size={12} /> Add to Bag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border/60 p-3 flex gap-2 shadow-lg">
        <button
          disabled={soldOut}
          onClick={handleAdd}
          className="flex-1 py-3 rounded-full border border-foreground text-foreground text-xs uppercase tracking-widest font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <ShoppingBag size={14} />
          {soldOut ? "Out of Stock" : "Add to Bag"}
        </button>
        <button
          disabled={soldOut}
          onClick={handleBuyNow}
          className="flex-1 py-3 rounded-full bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold shadow-md disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
