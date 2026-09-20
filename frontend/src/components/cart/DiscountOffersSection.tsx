import { useEffect, useState } from "react";
import { Tag, Check, X, Sparkles, ChevronRight, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/store";
import {
  type Offer,
  fetchOffers,
  isOfferActive,
  calculateCartOfferDiscount,
} from "@/lib/offers";
import { formatPrice } from "@/lib/settings";
import { motion, AnimatePresence } from "framer-motion";

export function DiscountOffersSection({ className }: { className?: string }) {
  const { items, appliedOffer, setAppliedOffer } = useCart();
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [inputCode, setInputCode] = useState("");
  const [showOffersDrawer, setShowOffersDrawer] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const all = await fetchOffers();
      const active = all.filter(isOfferActive);
      setAvailableOffers(active);
    })();
  }, []);

  const totalUnits = items.reduce((sum, i) => sum + i.qty, 0);
  const rawSubtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const discountResult = calculateCartOfferDiscount(
    items.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.qty })),
    appliedOffer
  );

  function getBOGORequiredUnits(offer: Offer) {
    return (offer.buyQty || 2) + (offer.getQty || 1);
  }

  function handleApplyCode(codeToApply?: string) {
    const code = (codeToApply || inputCode).trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    const matched = availableOffers.find((o) => o.code.toUpperCase() === code);
    if (!matched) {
      toast.error(`Coupon code "${code}" is invalid or expired`);
      return;
    }

    if (matched.type === "bogo") {
      const required = getBOGORequiredUnits(matched);
      if (totalUnits < required) {
        toast.error(`Need at least ${required} items in cart for "${matched.code}" (you have ${totalUnits})`);
        return;
      }
    }

    if (matched.minOrderValue > 0 && rawSubtotal < matched.minOrderValue) {
      toast.error(`Minimum order value for ${matched.code} is ${formatPrice(matched.minOrderValue)}`);
      return;
    }

    setAppliedOffer(matched);
    setInputCode("");
    setShowOffersDrawer(false);
    toast.success(`Coupon "${matched.code}" applied! 🎉`);
  }

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`bg-card border border-border/80 rounded-2xl p-3.5 space-y-2.5 shadow-xs ${className || ""}`}>
      {/* ── Applied Offer Banner ── */}
      {appliedOffer && discountResult.discountAmount > 0 ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Tag size={13} /> {appliedOffer.code}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                -{formatPrice(discountResult.discountAmount)}
              </span>
              <button
                type="button"
                onClick={() => setAppliedOffer(null)}
                className="text-[11px] text-muted-foreground hover:text-destructive font-medium underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
          <p className="text-[11px] text-foreground/80 font-medium">
            🎉 {discountResult.description || appliedOffer.title}
          </p>
          {discountResult.freeItemNames.length > 0 && (
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles size={11} /> FREE Item: {discountResult.freeItemNames.join(", ")}
            </p>
          )}
        </div>
      ) : (
        /* ── Compact Palmonas-style Coupon Box ── */
        <div className="flex items-center gap-2 border border-border/80 rounded-xl px-3 py-2 bg-background focus-within:border-accent transition-colors">
          <Tag size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            placeholder="Enter Coupon Code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyCode();
              }
            }}
            className="flex-1 bg-transparent text-xs font-mono uppercase outline-none placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => handleApplyCode()}
            className="text-xs uppercase font-bold text-accent hover:opacity-80 px-2 py-0.5 tracking-wider cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}

      {/* ── View All Offers Link ── */}
      <div className="text-center pt-0.5">
        <button
          type="button"
          onClick={() => setShowOffersDrawer(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline tracking-tight cursor-pointer"
        >
          <span>View All Offers</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Brand Offers Slide-Over Drawer Modal (Palmonas Style) ── */}
      <AnimatePresence>
        {showOffersDrawer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOffersDrawer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col z-10 shadow-2xl border border-border/80 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                  <Tag size={16} className="text-accent" /> Coupons &amp; Offers
                </h3>
                <button
                  type="button"
                  onClick={() => setShowOffersDrawer(false)}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Brand Offers Tab */}
              <div className="px-5 pt-3 pb-2 border-b border-border/40">
                <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold tracking-wide shadow-xs">
                  Brand Offers
                </span>
              </div>

              {/* Deals List */}
              <div className="p-5 space-y-3 overflow-y-auto max-h-[55vh]">
                {availableOffers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No active offers at the moment.
                  </p>
                ) : (
                  availableOffers.map((off) => {
                    const isApplied = appliedOffer?.id === off.id;
                    const required = off.type === "bogo" ? getBOGORequiredUnits(off) : 0;
                    const bogoMet = totalUnits >= required;
                    const minMet = off.minOrderValue <= 0 || rawSubtotal >= off.minOrderValue;
                    const canApply = (off.type !== "bogo" || bogoMet) && minMet;

                    return (
                      <div
                        key={off.id}
                        className={`rounded-2xl border p-4 text-xs transition-all relative overflow-hidden ${
                          isApplied
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-border/80 bg-card hover:border-accent/40 shadow-xs"
                        }`}
                      >
                        {/* Top: Code pill + Apply/Copy */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg border border-dashed border-accent/80 font-mono font-bold text-accent text-xs bg-accent/5">
                              {off.code}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(off.code, e)}
                              className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === off.code ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>

                          {isApplied ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/15 px-2.5 py-1 rounded-full text-[11px]">
                              <Check size={12} /> Applied
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApplyCode(off.code)}
                              className="text-xs uppercase font-bold text-accent hover:underline px-2.5 py-1 tracking-wider flex items-center gap-1"
                            >
                              {canApply ? (
                                <>Apply <ArrowRight size={11} /></>
                              ) : (
                                "Apply"
                              )}
                            </button>
                          )}
                        </div>

                        {/* Title & Description */}
                        <p className="font-semibold text-foreground text-xs mb-1">
                          {off.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {off.type === "bogo"
                            ? `Buy ${off.buyQty} get ${off.getQty} cheapest item FREE`
                            : off.type === "percentage"
                            ? `${off.discountValue}% off on your order`
                            : `Flat ₹${off.discountValue} discount on your order`}
                        </p>

                        {/* Conditional helper badge */}
                        {off.type === "bogo" && !isApplied && (
                          <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                            <span className={bogoMet ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>
                              {bogoMet
                                ? "✓ Your cart qualifies!"
                                : `Add ${required - totalUnits} more item${required - totalUnits !== 1 ? "s" : ""} to avail`}
                            </span>
                          </div>
                        )}

                        {off.minOrderValue > 0 && !isApplied && (
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            Min order value: {formatPrice(off.minOrderValue)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
