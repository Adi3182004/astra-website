import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Sparkles, 
  ChevronRight, 
  Tag, 
  X, 
  Check, 
  Gift, 
  Truck, 
  Percent,
  Copy,
  ArrowRight,
  ShieldCheck,
  Flame
} from "lucide-react";
import { useCart, cartSubtotal } from "@/lib/store";
import { formatPrice } from "@/lib/settings";
import { useCartStockGuard } from "@/hooks/useCartStockGuard";
import { useSeo } from "@/lib/seo";
import { 
  type Offer,
  fetchOffers,
  calculateCartOfferDiscount,
  splitCartItemsForBOGO,
} from "@/lib/offers";
import { 
  fetchRecommendationConfig, 
  getCartRecommendations, 
  type RecommendationItem, 
  type RecommendationConfig,
  DEFAULT_RECOMMENDATION_CONFIG 
} from "@/lib/recommendations";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const TOP_BANNER_SLIDES = [
  { text: "Buy 4 at ₹2999 | Use Code : MONSOON4", sub: "Priora Studs worth ₹1495", code: "MONSOON4", targetSpend: 2999 },
  { text: "FREE STUDS of ₹1495 on orders above ₹2999", sub: "Priora Luxury Gift worth ₹1495", code: "B1G1", targetSpend: 2999 },
  { text: "Buy 2 Get 1 FREE | Use Code : B2G1", sub: "Cheapest item automatically FREE", code: "B2G1", targetSpend: 1999 },
  { text: "20% OFF on Orders Above ₹1499 | Use Code : PRIORA20", sub: "Instant 20% discount applied", code: "PRIORA20", targetSpend: 1499 },
  { text: "FLAT ₹500 OFF on Orders Above ₹2499 | Use Code : FLAT500", sub: "Flat ₹500 discount on your order", code: "FLAT500", targetSpend: 2499 },
];

const MOCK_RECS: RecommendationItem[] = [
  { id: "r1", name: "Shadow Gem Necklace", price: 666, originalPrice: 3699, discountPct: 82, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&q=80", slug: "shadow-gem-necklace" },
  { id: "r2", name: "Glimmer Star Constellation Bracelet", price: 555, originalPrice: 2899, discountPct: 81, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80", slug: "glimmer-pearl-bracelet" },
  { id: "r3", name: "Rose Gold Huggie Earrings", price: 899, originalPrice: 2200, discountPct: 59, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80", slug: "rose-gold-huggie" },
  { id: "r4", name: "Stardust Stud Earrings", price: 449, originalPrice: 1299, discountPct: 65, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=300&q=80", slug: "stardust-stud-earrings" },
  { id: "r5", name: "Cherry Blossom Charm Bracelet", price: 666, originalPrice: 3699, discountPct: 82, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&q=80", slug: "cherry-blossom-charm-bracelet" },
];

export default function Cart() {
  const nav = useNavigate();
  const { items, setQty, remove, add, appliedOffer, setAppliedOffer } = useCart();
  useCartStockGuard();

  useSeo({
    title: "Your Cart — PRIORA by KP",
    description: "Review your selected handcrafted luxury jewellery, apply coupons, and checkout securely.",
    canonicalPath: "/cart",
  });

  const [offers, setOffers] = useState<Offer[]>([]);
  const [recConfig, setRecConfig] = useState<RecommendationConfig>(DEFAULT_RECOMMENDATION_CONFIG);
  const [recommendedItems, setRecommendedItems] = useState<RecommendationItem[]>([]);
  const [showOffersDrawer, setShowOffersDrawer] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Auto-swiping banner every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % TOP_BANNER_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Fetch offers & recommendations config — only on mount (not on items change to avoid re-render loop)
  useEffect(() => {
    fetchOffers().then((all) => setOffers(all.filter(isOfferActive)));
    fetchRecommendationConfig().then((cfg) => {
      setRecConfig(cfg);
      const recs = getCartRecommendations(cfg, useCart.getState().items.map((i) => i.productId));
      setRecommendedItems(recs.length > 0 ? recs : MOCK_RECS);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rawSubtotal = cartSubtotal(items);
  const offerResult = calculateCartOfferDiscount(
    items.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.qty })),
    appliedOffer
  );
  const splitItems = splitCartItemsForBOGO(items, appliedOffer);
  const finalTotal = Math.max(0, rawSubtotal - offerResult.discountAmount);
  const totalUnits = items.reduce((sum, i) => sum + i.qty, 0);

  // Progress towards gift / milestone
  const currentSlide = TOP_BANNER_SLIDES[activeSlideIdx];
  const targetThreshold = currentSlide.targetSpend || 2999;
  const progressPct = Math.min(100, Math.round((finalTotal / targetThreshold) * 100));

  // Automatically detach coupon if cart quantity or order value falls below requirements
  useEffect(() => {
    if (appliedOffer && items.length > 0 && offerResult.discountAmount === 0 && !offerResult.appliedOffer) {
      setAppliedOffer(null);
    }
  }, [appliedOffer, items, offerResult, setAppliedOffer]);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    const matched = offers.find((o) => o.code.toUpperCase() === code);
    if (!matched) {
      toast.error(`Coupon code "${code}" is invalid or expired`);
      return;
    }

    // If BOGO, check threshold
    if (matched.type === "bogo") {
      const required = (matched.buyQty || 2) + (matched.getQty || 1);
      if (totalUnits < required) {
        toast.error(`Need minimum ${required} items for "${matched.code}" (you have ${totalUnits})`);
        return;
      }
    }

    if (matched.minOrderValue > 0 && rawSubtotal < matched.minOrderValue) {
      toast.error(`Minimum order value for ${matched.code} is ${formatPrice(matched.minOrderValue)}`);
      return;
    }

    setAppliedOffer(matched);
    setCouponInput("");
    setShowOffersDrawer(false);
    toast.success(`Coupon "${matched.code}" applied! 🎉`);
  };

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddRecommendation = (rec: RecommendationItem) => {
    add({
      productId: rec.id,
      name: rec.name,
      price: rec.price,
      image: rec.image,
      slug: rec.slug,
    }, 1);
    toast.success(`Added ${rec.name} to bag!`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-[70vh]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={13} />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight size={13} />
          <span className="text-foreground font-medium">Cart</span>
        </div>

        {/* Empty Box Card */}
        <div className="max-w-md mx-auto text-center py-12 px-6 bg-card rounded-3xl border border-border/70 shadow-xs mb-10">
          <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <ShoppingBag size={28} />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl mb-1.5">Your Cart is empty</h2>
          <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">Discover handcrafted luxury jewellery made just for you.</p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-full text-xs uppercase tracking-widest font-semibold shadow-md hover:opacity-95 transition-all"
          >
            <span>Explore Shop</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Recommended For You — Horizontal Swipe (empty cart) */}
        {recommendedItems.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-accent shrink-0" />
                <h3 className="font-serif text-lg sm:text-xl font-semibold tracking-tight">
                  {recConfig.title || "Recommended For You"}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">Swipe to explore →</span>
            </div>
            <div className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-2 px-1">
              {recommendedItems.map((rec) => (
                <div
                  key={rec.id}
                  className="w-[160px] sm:w-[180px] shrink-0 rounded-2xl border border-border/70 bg-card p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-rose-50/50 dark:bg-secondary/30 mb-2.5 relative">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {rec.discountPct > 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                        {rec.discountPct}% off
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1 mb-1 font-serif">
                    {rec.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 mb-2.5">
                    <span className="text-sm font-bold text-foreground">{formatPrice(rec.price)}</span>
                    {rec.originalPrice > rec.price && (
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(rec.originalPrice)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddRecommendation(rec)}
                    className="w-full py-1.5 rounded-xl border border-foreground/80 hover:bg-foreground hover:text-background text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    + Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10 pb-36 md:pb-12 min-h-screen">
      {/* ── Breadcrumb & Title ── */}
      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight size={13} />
        <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <ChevronRight size={13} />
        <span className="text-foreground font-medium">Shopping Bag ({totalUnits})</span>
      </div>

      <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl mb-6">
        Shopping Bag
      </h1>

      {/* ── Main Responsive Grid ── */}
      <div className="grid md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px] 2xl:grid-cols-[1fr_450px] gap-6 lg:gap-8 2xl:gap-10 items-start">
        {/* ── LEFT COLUMN: Banner, Items, Coupons, Recommendations ── */}
        <div className="space-y-6">
          {/* Top Auto-swiping Banner */}
          <div className="bg-[#181113] text-white py-3 px-5 rounded-2xl text-center overflow-hidden relative shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlideIdx}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs sm:text-sm font-bold tracking-wide"
              >
                {currentSlide.text}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Free Gift Progress Milestone Bar */}
          <div className="p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 font-medium">
              <span className="truncate">{currentSlide.sub}</span>
              <span className="font-mono text-foreground font-semibold shrink-0">
                {formatPrice(targetThreshold)}
              </span>
            </div>

            <div className="relative flex items-center">
              <div className="flex-1 bg-border/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#181113] dark:bg-accent h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="ml-3 flex items-center gap-1.5 shrink-0">
                <span className="w-5 h-5 rounded-full bg-[#181113] text-white flex items-center justify-center">
                  <Gift size={11} />
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {progressPct >= 100 ? "Gift Unlocked! 🎉" : "Free Gift"}
                </span>
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3.5">
            {splitItems.map((i) => {
              return (
                <div 
                  key={i.productId} 
                  className={`bg-card border rounded-2xl p-4 flex gap-4 shadow-xs relative overflow-hidden group transition-colors ${
                    i.isFree ? "border-accent/60 bg-accent/5" : "border-border/70 hover:border-accent/40"
                  }`}
                >
                  {/* Thumbnail */}
                  <Link to={`/product/${i.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-secondary/40 flex-shrink-0 relative">
                    <img src={i.image} alt={i.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {i.isFree && (
                      <span className="absolute top-1.5 left-1.5 bg-[#E06A8B] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs leading-none tracking-wider z-10">
                        FREE
                      </span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link to={`/product/${i.slug}`} className="font-serif text-sm sm:text-base font-medium line-clamp-1 hover:text-accent transition-colors">
                          {i.name}
                        </Link>
                        <div className="mt-1 font-sans">
                          {i.isFree ? (
                            <span className="text-sm font-bold text-accent">FREE (₹0)</span>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-bold text-foreground">{formatPrice(i.totalPrice)}</span>
                              {i.qty > 1 && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  ({formatPrice(i.price)} each)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      {!i.isFree && (
                        <button 
                          type="button"
                          onClick={() => remove(i.parentProductId)} 
                          className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                          aria-label="Remove item"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Qty Pill */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {i.isFree ? "Free Item (BOGO Offer)" : "Quantity"}
                      </span>
                      {i.isFree ? (
                        <span className="text-xs font-bold text-accent px-3 py-1 bg-accent/15 rounded-xl font-mono">
                          Qty: {i.qty}
                        </span>
                      ) : (
                        <div className="flex items-center border border-border/80 rounded-xl bg-secondary/30 px-1 py-0.5 text-xs">
                          <button 
                            type="button"
                            onClick={() => setQty(i.parentProductId, Math.max(1, i.totalOriginalQty - 1))} 
                            className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 font-semibold text-xs min-w-[1.75rem] text-center font-mono">
                            {i.qty}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setQty(i.parentProductId, i.totalOriginalQty + 1)} 
                            className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Box */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3 shadow-xs">
            {appliedOffer && offerResult.discountAmount > 0 ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
                  <Tag size={15} /> {appliedOffer.code} (-{formatPrice(offerResult.discountAmount)})
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedOffer(null)}
                  className="text-xs text-muted-foreground hover:text-destructive font-medium cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 border border-border/80 rounded-xl px-3.5 py-2.5 bg-background focus-within:border-accent transition-colors">
                <Tag size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                  className="flex-1 bg-transparent text-xs sm:text-sm font-mono uppercase outline-none placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="text-xs uppercase font-bold text-accent hover:opacity-80 px-3 py-1 tracking-wider cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}

            {/* View All Offers Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowOffersDrawer(true)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-accent hover:underline tracking-tight cursor-pointer"
              >
                <span>View All Offers</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* ── "Recommended For You" — Horizontal Swipeable Row ── */}
          {recommendedItems.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent shrink-0" />
                  <h2 className="font-serif text-lg sm:text-xl font-semibold tracking-tight">
                    {recConfig.title || "Recommended For You"}
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">Swipe to explore →</span>
              </div>

              {/* Horizontal swipe row */}
              <div className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-2 pt-1 items-stretch">
                {recommendedItems.map((rec) => (
                  <div
                    key={rec.id}
                    className="w-[155px] sm:w-[170px] shrink-0 rounded-2xl border border-border/70 bg-card p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group h-full"
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Image */}
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-rose-50/50 dark:bg-secondary/30 mb-2 relative">
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {rec.discountPct > 0 && (
                          <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            {rec.discountPct}% off
                          </span>
                        )}
                      </div>

                      {/* Name & Price with fixed min-height */}
                      <div className="min-h-[46px] flex flex-col justify-between mb-2.5">
                        <p className="text-xs font-medium text-foreground line-clamp-1 mb-1 font-serif">
                          {rec.name}
                        </p>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-foreground">
                            {formatPrice(rec.price)}
                          </span>
                          {rec.originalPrice > rec.price && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(rec.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart button */}
                    <button
                      type="button"
                      onClick={() => handleAddRecommendation(rec)}
                      className="w-full mt-auto py-1.5 rounded-xl border border-foreground/80 hover:bg-foreground hover:text-background text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: Desktop Sticky Order Summary ── */}
        <div className="hidden md:block sticky top-24 space-y-4">
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl font-semibold">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalUnits} {totalUnits === 1 ? "item" : "items"})</span>
                <span className="font-mono text-foreground font-medium">{formatPrice(rawSubtotal)}</span>
              </div>

              {appliedOffer && offerResult.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Coupon Discount ({appliedOffer.code})</span>
                  <span className="font-mono">-{formatPrice(offerResult.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Standard Delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase text-xs">FREE</span>
              </div>

              <div className="border-t border-border/80 pt-3.5 flex justify-between items-baseline">
                <span className="font-serif text-base font-semibold">Estimated Total</span>
                <span className="font-serif text-2xl font-bold text-foreground">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Free shipping pill */}
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2">
              <Truck size={14} className="shrink-0" />
              <span>FREE insured shipping included on all orders</span>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={() => nav("/checkout")}
              className="w-full py-3.5 rounded-2xl bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold hover:opacity-95 shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} />
            </button>

            {/* Trust Badges */}
            <div className="pt-2 grid grid-cols-2 gap-2 text-center text-[11px] text-muted-foreground">
              <div className="flex items-center justify-center gap-1 p-2 rounded-xl bg-secondary/30">
                <ShieldCheck size={14} className="text-accent" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center justify-center gap-1 p-2 rounded-xl bg-secondary/30">
                <Lock size={13} className="text-accent" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Fixed Bottom Total & Checkout Bar ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border/80 p-4 shadow-xl z-30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <span>Estimated Total</span>
          </div>
          <span className="text-lg font-bold font-serif text-foreground">
            {formatPrice(finalTotal)}
          </span>
        </div>

        <div className="mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-full">
            <Truck size={12} /> FREE shipping included
          </span>
        </div>

        <button
          type="button"
          onClick={() => nav("/checkout")}
          className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold hover:opacity-95 shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ── Palmonas Offers Drawer Modal (Brand Offers) ── */}
      <AnimatePresence>
        {showOffersDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowOffersDrawer(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl border border-border flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-serif text-lg font-medium">Your Cart ({totalUnits} items)</h3>
                <button
                  type="button"
                  onClick={() => setShowOffersDrawer(false)}
                  className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="overflow-y-auto p-5 space-y-4">
                {/* Brand Offers Tab (Active pill matching screenshot) */}
                <div className="flex gap-2">
                  <span className="border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 text-xs font-semibold px-4 py-1.5 rounded-full">
                    Brand Offers
                  </span>
                </div>

                {/* Coupon input inside drawer */}
                <div className="flex items-center gap-2 border border-border/80 rounded-xl px-3 py-2 bg-background focus-within:border-accent">
                  <Tag size={13} className="text-emerald-600" />
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-transparent text-xs font-mono uppercase outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="text-xs uppercase font-bold text-accent hover:opacity-80 px-2 py-0.5"
                  >
                    Apply
                  </button>
                </div>

                {/* Offers List (Available & Unavailable) */}
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
                    Available &amp; Special Offers
                  </p>

                  <div className="divide-y divide-border/50 space-y-3">
                    {offers.map((off) => {
                      const required = off.type === "bogo" ? (off.buyQty || 2) + (off.getQty || 1) : 0;
                      const isQualifying = off.type !== "bogo" || totalUnits >= required;
                      const isApplied = appliedOffer?.id === off.id;

                      return (
                        <div key={off.id} className="pt-3 first:pt-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                                  <Percent size={11} />
                                </span>
                                <span className="border border-dashed border-border px-2.5 py-0.5 rounded-md font-mono text-xs font-bold text-foreground">
                                  {off.code}
                                </span>
                              </div>

                              {/* Red condition note if not yet met */}
                              {!isQualifying && off.type === "bogo" && (
                                <p className="text-[11px] text-destructive font-medium">
                                  Add {required - totalUnits} more items to avail
                                </p>
                              )}

                              <p className="text-xs text-muted-foreground">
                                {off.type === "bogo"
                                  ? `Get any ${required} for Buy ${off.buyQty} Get ${off.getQty} FREE`
                                  : off.type === "percentage"
                                  ? `${off.discountValue}% off order`
                                  : `Flat ₹${off.discountValue} discount`}
                              </p>
                            </div>

                            {/* Action Button */}
                            {isApplied ? (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/15 px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
                                <Check size={12} /> Applied
                              </span>
                            ) : isQualifying ? (
                              <button
                                type="button"
                                onClick={() => handleApplyCoupon(off.code)}
                                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 shrink-0 cursor-pointer"
                              >
                                Apply
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowOffersDrawer(false);
                                  nav("/shop");
                                }}
                                className="text-xs font-bold text-accent hover:underline px-2 py-1 shrink-0 cursor-pointer"
                              >
                                + Add Item(s)
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
