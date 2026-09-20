import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X, Minus, Plus, Trash2, Tag, ChevronRight,
  Gift, Truck, Sparkles, ArrowRight, Percent, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, cartSubtotal } from "@/lib/store";
import { formatPrice } from "@/lib/settings";
import {
  fetchOffers,
  isOfferActive,
  calculateCartOfferDiscount,
  splitCartItemsForBOGO,
  type Offer,
} from "@/lib/offers";
import {
  fetchRecommendationConfig, getCartRecommendations,
  type RecommendationItem, type RecommendationConfig, DEFAULT_RECOMMENDATION_CONFIG,
} from "@/lib/recommendations";
import { toast } from "sonner";

const TOP_BANNER_SLIDES = [
  { text: "Buy 4 at ₹2999 | Use Code : MONSOON4", targetSpend: 2999 },
  { text: "FREE STUDS of ₹1495 on orders above ₹2999", targetSpend: 2999 },
  { text: "Buy 2 Get 1 FREE | Use Code : B2G1", targetSpend: 1999 },
  { text: "20% OFF on Orders Above ₹1499 | Use Code : PRIORA20", targetSpend: 1499 },
  { text: "FLAT ₹500 OFF on Orders Above ₹2499 | Use Code : FLAT500", targetSpend: 2499 },
];

// ── Mock fallback data for localhost testing ──────────────────────────────
const MOCK_OFFERS: Offer[] = [
  { id: "m1", code: "MONSOON2", type: "bogo", buyQty: 1, getQty: 1, discountValue: 0, minOrderValue: 0, isActive: true, title: "Get any 2 for ₹1899", description: "Get any 2 for ₹1899" } as any,
  { id: "m2", code: "PRIORA20", type: "percentage", discountValue: 20, minOrderValue: 1499, isActive: true, title: "20% off", description: "20% off orders above ₹1499" } as any,
  { id: "m3", code: "FLAT500", type: "flat", discountValue: 500, minOrderValue: 2499, isActive: true, title: "Flat ₹500 off", description: "Flat ₹500 off orders above ₹2499" } as any,
  { id: "m4", code: "B2G1", type: "bogo", buyQty: 2, getQty: 1, discountValue: 0, minOrderValue: 0, isActive: true, title: "Buy 2 Get 1 Free", description: "Buy 2 Get 1 FREE" } as any,
  { id: "m5", code: "MONSOON4", type: "bogo", buyQty: 3, getQty: 1, discountValue: 0, minOrderValue: 0, isActive: true, title: "Buy 4 at ₹2999", description: "Get any 4 for ₹2999" } as any,
];

const MOCK_RECS: RecommendationItem[] = [
  { id: "r1", name: "Shadow Gem Necklace", price: 666, originalPrice: 3699, discountPct: 82, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&q=80", slug: "shadow-gem-necklace" },
  { id: "r2", name: "Glimmer Pearl Bracelet", price: 555, originalPrice: 2899, discountPct: 81, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80", slug: "glimmer-pearl-bracelet" },
  { id: "r3", name: "Rose Gold Huggie", price: 899, originalPrice: 2200, discountPct: 59, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80", slug: "rose-gold-huggie" },
  { id: "r4", name: "Stardust Stud Earrings", price: 449, originalPrice: 1299, discountPct: 65, image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=300&q=80", slug: "stardust-stud-earrings" },
];
// ─────────────────────────────────────────────────────────────────────────────

export function CartDrawer() {
  const nav = useNavigate();
  const {
    items, setQty, remove, add, appliedOffer, setAppliedOffer,
    drawerOpen, closeDrawer,
  } = useCart();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [recConfig, setRecConfig] = useState<RecommendationConfig>(DEFAULT_RECOMMENDATION_CONFIG);
  const [recommendedItems, setRecommendedItems] = useState<RecommendationItem[]>([]);
  const [showOffersPanel, setShowOffersPanel] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  useEffect(() => {
    if (!drawerOpen) return;
    const t = setInterval(() => setActiveSlideIdx((p) => (p + 1) % TOP_BANNER_SLIDES.length), 3000);
    return () => clearInterval(t);
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    fetchOffers().then((all) => {
      const live = all.filter(isOfferActive);
      setOffers(live.length > 0 ? live : MOCK_OFFERS);
    });
    fetchRecommendationConfig().then((cfg) => {
      setRecConfig(cfg);
      const recs = getCartRecommendations(cfg, useCart.getState().items.map((i) => i.productId));
      setRecommendedItems(recs.length > 0 ? recs : MOCK_RECS);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);


  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const rawSubtotal = cartSubtotal(items);
  const offerResult = useMemo(() =>
    calculateCartOfferDiscount(
      items.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.qty })),
      appliedOffer,
    ), [items, appliedOffer]);
  const splitItems = useMemo(() => splitCartItemsForBOGO(items, appliedOffer), [items, appliedOffer]);
  const finalTotal = Math.max(0, rawSubtotal - offerResult.discountAmount);
  const totalUnits = items.reduce((s, i) => s + i.qty, 0);
  const currentSlide = TOP_BANNER_SLIDES[activeSlideIdx] || TOP_BANNER_SLIDES[0];
  const targetSpend = currentSlide?.targetSpend || 2999;
  const progressPct = Math.min(100, Math.round((finalTotal / targetSpend) * 100));

  // Automatically detach coupon if cart quantity or order value falls below requirements
  useEffect(() => {
    if (appliedOffer && items.length > 0 && offerResult.discountAmount === 0 && !offerResult.appliedOffer) {
      setAppliedOffer(null);
    }
  }, [appliedOffer, items, offerResult, setAppliedOffer]);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) { toast.error("Please enter a coupon code"); return; }
    const matched = offers.find((o) => o.code.toUpperCase() === code);
    if (!matched) { toast.error(`Coupon "${code}" is invalid or expired`); return; }
    if (matched.type === "bogo") {
      const required = (matched.buyQty || 2) + (matched.getQty || 1);
      if (totalUnits < required) { toast.error(`Need ${required} items for "${matched.code}"`); return; }
    }
    if (matched.minOrderValue > 0 && rawSubtotal < matched.minOrderValue) {
      toast.error(`Min order ${formatPrice(matched.minOrderValue)} for ${matched.code}`); return;
    }
    setAppliedOffer(matched);
    setCouponInput("");
    setShowOffersPanel(false);
    toast.success(`Coupon "${matched.code}" applied!`);
  };

  const handleAddRec = (rec: RecommendationItem) => {
    add({ productId: rec.id, name: rec.name, price: rec.price, image: rec.image, slug: rec.slug }, 1);
    toast.success(`Added ${rec.name} to bag!`);
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
            onClick={closeDrawer}
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed right-0 top-0 bottom-0 z-[61] w-full max-w-[420px] bg-background shadow-2xl flex flex-col"
          >
            <AnimatePresence>
              {showOffersPanel && (
                <motion.div
                  key="offers-panel"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 340, damping: 36 }}
                  className="absolute inset-0 z-10 bg-background flex flex-col"
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <h3 className="font-serif text-base font-medium">Your Cart ({totalUnits} {totalUnits === 1 ? "item" : "items"})</h3>
                    <button type="button" onClick={() => setShowOffersPanel(false)} className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"><X size={15} /></button>
                  </div>
                  <div className="px-5 pt-4 pb-3 shrink-0">
                    <span className="inline-block border-2 border-emerald-600 text-emerald-800 dark:text-emerald-200 text-xs font-semibold px-4 py-1.5 rounded-full">Brand Offers</span>
                  </div>
                  <div className="px-5 pb-3 shrink-0">
                    <div className="flex items-center gap-2 border border-border/80 rounded-xl px-3 py-2 bg-background focus-within:border-accent transition-colors">
                      <Tag size={13} className="text-emerald-600 shrink-0" />
                      <input type="text" placeholder="Enter Coupon Code" value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                        className="flex-1 bg-transparent text-xs font-mono uppercase outline-none placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground" />
                      <button type="button" onClick={() => handleApplyCoupon()} className="text-xs uppercase font-bold text-accent hover:opacity-80 px-2 cursor-pointer">Apply</button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 pb-6">
                    <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">Unavailable Offers</p>
                    <div className="divide-y divide-dashed divide-border/50">
                      {offers.map((off) => {
                        const required = off.type === "bogo" ? (off.buyQty || 2) + (off.getQty || 1) : 0;
                        const isQualifying = off.type !== "bogo" || totalUnits >= required;
                        const isApplied = appliedOffer?.id === off.id;
                        return (
                          <div key={off.id} className="py-3.5 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Percent size={11} /></span>
                              <div className="min-w-0">
                                <span className="inline-block border border-dashed border-border px-2 py-0.5 rounded-md font-mono text-xs font-bold mb-1">{off.code}</span>
                                {!isQualifying && off.type === "bogo" && <p className="text-[11px] text-destructive font-medium">Add {required - totalUnits} more item{required - totalUnits > 1 ? "s" : ""} to avail</p>}
                                <p className="text-xs text-muted-foreground">
                                  {off.type === "bogo" ? `Get any ${required} for Buy ${off.buyQty} Get ${off.getQty} FREE` : off.type === "percentage" ? `${off.discountValue}% off order` : `Flat \u20b9${off.discountValue} discount`}
                                </p>
                              </div>
                            </div>
                            {isApplied ? (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0"><Check size={11} /> Applied</span>
                            ) : isQualifying ? (
                              <button type="button" onClick={() => handleApplyCoupon(off.code)} className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 shrink-0 cursor-pointer">Apply</button>
                            ) : (
                              <button type="button" onClick={() => { setShowOffersPanel(false); nav("/shop"); }} className="text-xs font-bold text-accent hover:underline px-2 py-1 shrink-0 cursor-pointer whitespace-nowrap">+ Add Item(s)</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 shrink-0">
              <h2 className="font-serif text-base font-medium">Your Cart ({totalUnits} {totalUnits === 1 ? "item" : "items"})</h2>
              <button type="button" onClick={closeDrawer} className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer" aria-label="Close"><X size={15} /></button>
            </div>

            <div className="bg-[#181113] text-white py-2.5 px-4 text-center overflow-hidden relative shrink-0">
              <AnimatePresence mode="wait">
                <motion.div key={activeSlideIdx} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.3 }} className="text-[11px] font-bold tracking-wide">
                  {currentSlide.text}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-4 py-2 bg-secondary/20 border-b border-border/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-border/50 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#181113] dark:bg-accent h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="w-4 h-4 rounded-full bg-[#181113] text-white flex items-center justify-center"><Gift size={9} /></span>
                  <span className="text-[10px] font-semibold">{progressPct >= 100 ? "Gift Unlocked!" : formatPrice(targetSpend)}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground"><Sparkles size={22} /></div>
                  <p className="font-serif text-lg">Your cart is empty</p>
                  <p className="text-xs text-muted-foreground">Discover handcrafted luxury jewellery.</p>
                  <button type="button" onClick={() => { closeDrawer(); nav("/shop"); }} className="mt-2 bg-accent text-accent-foreground px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:opacity-95 transition-all cursor-pointer">Explore Shop</button>
                </div>
              ) : (
                <div className="pb-4">
                  <div className="p-4 space-y-3">
                    {splitItems.map((i) => {
                      return (
                        <div
                          key={i.productId}
                          className={`bg-card border rounded-xl p-3 flex gap-3 ${
                            i.isFree ? "border-accent/50 bg-accent/5" : "border-border/60"
                          }`}
                        >
                          <Link to={`/product/${i.slug}`} onClick={closeDrawer} className="w-16 h-16 rounded-lg overflow-hidden bg-secondary/30 shrink-0 relative">
                            <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                            {i.isFree && (
                              <span className="absolute top-1 left-1 bg-[#E06A8B] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs leading-none tracking-wider z-10">
                                FREE
                              </span>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <Link to={`/product/${i.slug}`} onClick={closeDrawer} className="font-serif text-xs font-medium line-clamp-1 hover:text-accent transition-colors">
                                  {i.name}
                                </Link>
                                <div className="mt-0.5">
                                  {i.isFree ? (
                                    <span className="text-xs font-bold text-accent">FREE (₹0)</span>
                                  ) : (
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="text-xs font-semibold text-foreground">{formatPrice(i.totalPrice)}</span>
                                      {i.qty > 1 && (
                                        <span className="text-[10px] text-muted-foreground font-normal">
                                          ({formatPrice(i.price)} each)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {!i.isFree && (
                                <button
                                  type="button"
                                  onClick={() => remove(i.parentProductId)}
                                  className="text-muted-foreground hover:text-destructive p-0.5 transition-colors shrink-0 cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[11px] text-muted-foreground">
                                {i.isFree ? "Free Item (BOGO Offer)" : "Quantity"}
                              </span>
                              {i.isFree ? (
                                <span className="text-xs font-bold text-accent px-2 py-0.5 bg-accent/15 rounded-md font-mono">
                                  Qty: {i.qty}
                                </span>
                              ) : (
                                <div className="flex items-center border border-border/70 rounded-lg bg-secondary/30 px-1 py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setQty(i.parentProductId, Math.max(1, i.totalOriginalQty - 1))}
                                    className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="px-2 font-semibold text-xs min-w-[1.5rem] text-center font-mono">
                                    {i.qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const originalItem = items.find((it) => it.productId === i.parentProductId);
                                      const maxStk = originalItem?.stock;
                                      if (maxStk != null && i.totalOriginalQty >= maxStk) {
                                        toast.error(`Only ${maxStk} item${maxStk > 1 ? "s" : ""} available in stock`);
                                        return;
                                      }
                                      setQty(i.parentProductId, i.totalOriginalQty + 1);
                                    }}
                                    className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-4 mb-4">
                    <div className="bg-card border border-border/60 rounded-xl p-3 space-y-2">
                      {appliedOffer && offerResult.discountAmount > 0 ? (
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400"><Tag size={12} /> {appliedOffer.code} (-{formatPrice(offerResult.discountAmount)})</div>
                          <button type="button" onClick={() => setAppliedOffer(null)} className="text-[11px] text-muted-foreground hover:text-destructive font-medium cursor-pointer">Remove</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 border border-border/70 rounded-lg px-3 py-2 bg-background focus-within:border-accent transition-colors">
                          <Tag size={13} className="text-emerald-600 shrink-0" />
                          <input type="text" placeholder="Enter Coupon Code" value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => { if (e.key === "Enter") handleApplyCoupon(); }}
                            className="flex-1 bg-transparent text-xs font-mono uppercase outline-none placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground" />
                          <button type="button" onClick={() => handleApplyCoupon()} className="text-xs uppercase font-bold text-accent hover:opacity-80 px-2 cursor-pointer">Apply</button>
                        </div>
                      )}
                      <div className="text-center pt-0.5">
                        <button type="button" onClick={() => setShowOffersPanel(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline cursor-pointer">View All Offers <ChevronRight size={13} /></button>
                      </div>
                    </div>
                  </div>

                  {recommendedItems.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 px-4 mb-2">
                        <Sparkles size={12} className="text-accent shrink-0" />
                        <h3 className="font-serif text-xs font-semibold tracking-tight">{recConfig.title || "Recommended For You"}</h3>
                      </div>
                      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
                        {recommendedItems.map((rec) => (
                          <div key={rec.id} className="w-[130px] shrink-0 rounded-xl border border-border/60 bg-card p-2 flex flex-col justify-between group">
                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-rose-50/50 dark:bg-secondary/30 mb-1.5 relative">
                              <img src={rec.image} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              {rec.discountPct > 0 && <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-bold px-1 py-0.5 rounded">{rec.discountPct}% off</span>}
                            </div>
                            <p className="text-[10px] font-medium line-clamp-1 mb-1">{rec.name}</p>
                            <div className="flex items-baseline gap-1 mb-1.5">
                              <span className="text-[11px] font-bold">{formatPrice(rec.price)}</span>
                              {rec.originalPrice > rec.price && <span className="text-[9px] text-muted-foreground line-through">{formatPrice(rec.originalPrice)}</span>}
                            </div>
                            <button type="button" onClick={() => handleAddRec(rec)} className="w-full py-1 rounded-lg bg-foreground text-background text-[9px] font-semibold uppercase tracking-wide hover:opacity-85 active:scale-95 transition-all cursor-pointer">+ Add</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border/70 bg-background/95 backdrop-blur px-4 py-3 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Estimated Total</span>
                  <span className="text-base font-bold font-serif">{formatPrice(finalTotal)}</span>
                </div>
                <div className="mb-2.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full"><Truck size={10} /> FREE shipping included</span>
                </div>
                <button type="button" onClick={() => { closeDrawer(); nav("/checkout"); }}
                  className="w-full py-3 rounded-xl bg-accent text-accent-foreground text-xs uppercase tracking-widest font-semibold hover:opacity-95 shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <span>Proceed to Checkout</span><ArrowRight size={13} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
