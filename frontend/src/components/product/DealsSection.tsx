import { useState, useRef, useEffect, useCallback } from "react";
import { Copy, Check, X, ChevronRight, Percent } from "lucide-react";
import { fetchOffersConfig, isOfferActive, type Offer } from "@/lib/offers";
import { toast } from "sonner";
import { formatPrice } from "@/lib/settings";
import { AnimatePresence, motion } from "framer-motion";

interface DealDisplay {
  getFor: number;
  originalFor: number;
  buyNote: string;
  minNote: string;
  saveNote: string;
}

function getDealDisplay(offer: Offer, price: number): DealDisplay | null {
  if (offer.type === "bogo") {
    const buy = offer.buyQty ?? 2;
    const get = offer.getQty ?? 1;
    const total = buy + get;
    const payTotal = price * buy;
    const origTotal = price * total;
    const saved = price * get;
    return {
      getFor: Math.round(payTotal / total),
      originalFor: origTotal,
      buyNote: `Buy ${total} for ${formatPrice(payTotal)}`,
      minNote: `You need to add minimum ${total} products.`,
      saveNote: `Save ${formatPrice(saved)}`,
    };
  }
  if (offer.type === "percentage") {
    const pct = offer.discountValue ?? 0;
    const saved = (price * pct) / 100;
    return {
      getFor: Math.round(price - saved),
      originalFor: price,
      buyNote: `Save ${pct}% on this item`,
      minNote: offer.minOrderValue > 0 ? `Minimum order ${formatPrice(offer.minOrderValue)}.` : "No minimum order requirement.",
      saveNote: `Save ${pct}%`,
    };
  }
  if (offer.type === "fixed") {
    const saved = offer.discountValue ?? 0;
    return {
      getFor: Math.max(0, Math.round(price - saved)),
      originalFor: price,
      buyNote: `Flat ${formatPrice(saved)} discount`,
      minNote: offer.minOrderValue > 0 ? `Minimum order ${formatPrice(offer.minOrderValue)}.` : "No minimum order requirement.",
      saveNote: `Save ${formatPrice(saved)}`,
    };
  }
  return null;
}

export function DealsSection({ productPrice }: { productPrice: number }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    fetchOffersConfig().then((cfg) => {
      setOffers(cfg.offers.filter(isOfferActive));
    });
  }, []);

  const copyCode = useCallback((code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      toast.success(`Coupon code "${code}" copied!`);
      setTimeout(() => setCopied(null), 2500);
    }).catch(() => toast.error("Could not copy"));
  }, []);

  // Smooth drag-to-scroll swipe handling
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".deals-coupon-btn")) return;
    if (!scrollRef.current) return;
    setIsDragging(true);
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  if (!offers.length) return null;

  return (
    <>
      {/* ── Palmonas-style Deals Box with Native Bow Cursor ── */}
      <div
        style={{
          cursor: "url('/bow-cursor-30.png') 15 15, url('/bow-cursor.png') 15 15, url('/bow.svg') 15 15, auto",
        }}
        className="deals-bow-area mt-5 rounded-2xl border border-rose-200/80 dark:border-rose-900/30 overflow-hidden bg-gradient-to-r from-[#FFF5F7] via-[#FFF0F4] to-[#FFF9F6] dark:from-card/90 dark:to-card/50 shadow-sm relative select-none"
      >
        {/* Top Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/70 dark:bg-card/60 border-b border-rose-200/50 dark:border-border/40">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-[#681938] to-[#9E2A54] text-white shadow-xs">
            <Percent size={12} strokeWidth={2.5} />
          </span>
          <span className="font-serif text-sm font-semibold tracking-wide text-foreground">
            Deals
          </span>
        </div>

        {/* Horizontal Swipeable Cards */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex gap-3 px-3 py-3.5 overflow-x-auto scrollbar-hide select-none"
        >
          {offers.map((offer) => {
            const deal = getDealDisplay(offer, productPrice);
            if (!deal) return null;
            return (
              <div
                key={offer.id}
                className="flex-shrink-0 w-[245px] sm:w-[260px] rounded-xl bg-white dark:bg-background border border-border/80 shadow-xs relative overflow-hidden flex flex-col justify-between"
              >
                {/* OFFER ENDING SOON ribbon */}
                <div className="bg-[#481222] dark:bg-[#380e1b] text-white px-3 py-1 flex items-center gap-1.5 shadow-xs">
                  <div
                    className="w-0 h-0"
                    style={{
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                      borderRight: "5px solid #F5C518",
                    }}
                  />
                  <span className="text-[9px] font-bold uppercase tracking-[0.16em]">
                    OFFER ENDING SOON
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 pr-1">
                      <p className="text-sm font-bold text-foreground font-sans tracking-tight">
                        Get for {formatPrice(deal.getFor)}
                      </p>
                      <div className="h-px bg-border/60 my-1 w-full" />
                      <p className="text-[11px] font-medium text-foreground/80 leading-snug">
                        {deal.buyNote}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                        Note: {deal.minNote}
                      </p>
                    </div>

                    {/* Dashed green coupon code badge */}
                    <button
                      type="button"
                      onClick={(e) => copyCode(offer.code, e)}
                      title="Click to copy coupon code"
                      className="deals-coupon-btn flex-shrink-0 flex items-center gap-1 border border-dashed border-emerald-600 dark:border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold px-2 py-1.5 rounded-md hover:bg-emerald-100/90 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{offer.code}</span>
                      {copied === offer.code ? (
                        <Check size={12} className="text-emerald-600" />
                      ) : (
                        <Copy size={12} className="opacity-80" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* View All Card */}
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex-shrink-0 w-28 rounded-xl bg-white/80 dark:bg-background/80 border-2 border-dashed border-rose-300 dark:border-rose-800 hover:border-rose-500 flex flex-col items-center justify-center gap-1.5 p-3 text-foreground hover:text-accent transition-all group"
          >
            <span className="text-xs font-semibold tracking-wide group-hover:underline">
              View All
            </span>
            <ChevronRight size={16} className="text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowAll(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl border border-border flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-serif text-xl font-medium tracking-tight">All Offers</h3>
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto p-5 space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
                    Applicable offers
                  </p>
                  <div className="space-y-3">
                    {offers.map((offer) => {
                      const deal = getDealDisplay(offer, productPrice);
                      if (!deal) return null;
                      return (
                        <div
                          key={offer.id}
                          className="rounded-2xl border border-border/80 bg-card/60 p-4 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-base font-bold text-foreground">
                                Get for {formatPrice(deal.getFor)}
                              </p>
                              <p className="text-xs font-medium text-foreground/80 mt-0.5">
                                {deal.buyNote}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Note: {deal.minNote}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => copyCode(offer.code, e)}
                              title="Click to copy coupon code"
                              className="deals-coupon-btn flex-shrink-0 flex items-center gap-1.5 border border-dashed border-emerald-600 dark:border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <span>{offer.code}</span>
                              {copied === offer.code ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
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
    </>
  );
}
