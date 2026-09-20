import { useEffect, useState } from "react";
import { 
  Plus, 
  Gift, 
  Tag, 
  Clock, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  Percent, 
  History, 
  Loader2, 
  X,
  Play,
  Pause,
  RotateCcw,
  Archive,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { 
  type Offer, 
  type OfferType, 
  fetchOffersConfig, 
  saveOffersConfig, 
  isOfferExpired, 
  isOfferActive,
  getDaysRemainingInHistory,
  saveOffers
} from "@/lib/offers";


export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tab filter: "active" | "paused" | "history" | "all"
  const [filter, setFilter] = useState<"active" | "paused" | "history" | "all">("active");

  const [modalOpen, setModalOpen] = useState(false);
  const [historyModalOffer, setHistoryModalOffer] = useState<Offer | null>(null);
  const [extendModalOffer, setExtendModalOffer] = useState<Offer | null>(null);
  const [extendHours, setExtendHours] = useState(72);

  // Create Form State
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<OfferType>("bogo");
  const [buyQty, setBuyQty] = useState(2);
  const [getQty, setGetQty] = useState(1);
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [durationHours, setDurationHours] = useState(48);

  async function load() {
    setLoading(true);
    const cfg = await fetchOffersConfig();
    setOffers(cfg.offers);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function generateRandomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let res = "";
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(res);
  }

  async function handleCreateOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an offer title");
      return;
    }

    const finalCode = (code.trim() || `OFFER-${Math.floor(Math.random() * 9000 + 1000)}`).toUpperCase();
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      title: title.trim(),
      code: finalCode,
      type,
      buyQty: type === "bogo" ? buyQty : 0,
      getQty: type === "bogo" ? getQty : 0,
      discountValue: type !== "bogo" ? discountValue : 0,
      minOrderValue,
      durationHours,
      startDate,
      endDate,
      isActive: true,
      usageCount: 0,
      createdAt: startDate,
      history: [
        {
          action: "created",
          timestamp: startDate,
          note: `Created with code ${finalCode}, validity ${durationHours}h`,
        },
      ],
    };

    setSaving(true);
    const updated = [newOffer, ...offers];
    const ok = await saveOffers(updated);
    setSaving(false);

    if (ok) {
      setOffers(updated);
      setModalOpen(false);
      setTitle("");
      setCode("");
      setType("bogo");
      setBuyQty(2);
      setGetQty(1);
      setDiscountValue(20);
      setMinOrderValue(0);
      setDurationHours(48);
      toast.success("Offer created & published to storefront!");
    } else {
      toast.error("Failed to create offer");
    }
  }

  // Toggle Pause / Resume
  async function togglePause(offer: Offer) {
    const nextState = !offer.isActive;
    const now = new Date().toISOString();
    const updated = offers.map((o) => {
      if (o.id === offer.id) {
        const historyEntry = {
          action: nextState ? "resumed" : "paused",
          timestamp: now,
          note: `Offer manually ${nextState ? "resumed" : "paused"} by admin`,
        };
        return {
          ...o,
          isActive: nextState,
          history: [...(o.history || []), historyEntry],
        };
      }
      return o;
    });

    setOffers(updated);
    await saveOffers(updated);
    toast.success(`Offer ${nextState ? "resumed & live in storefront" : "paused & hidden from customers"}`);
  }

  // Reactivate / Extend an expired or archived offer
  async function handleExtendValidity() {
    if (!extendModalOffer) return;
    const now = new Date();
    const newEndDate = new Date(now.getTime() + extendHours * 3600 * 1000).toISOString();

    const updated = offers.map((o) => {
      if (o.id === extendModalOffer.id) {
        const historyEntry = {
          action: "extended",
          timestamp: now.toISOString(),
          note: `Extended validity by ${extendHours}h (new expiry: ${new Date(newEndDate).toLocaleDateString()})`,
        };
        return {
          ...o,
          isActive: true,
          durationHours: extendHours,
          startDate: now.toISOString(),
          endDate: newEndDate,
          history: [...(o.history || []), historyEntry],
        };
      }
      return o;
    });

    setOffers(updated);
    await saveOffers(updated);
    setExtendModalOffer(null);
    toast.success(`Offer "${extendModalOffer.code}" reactivated for ${extendHours} hours!`);
  }

  async function deleteOffer(id: string) {
    if (!confirm("Are you sure you want to permanently delete this offer?")) return;
    const updated = offers.filter((o) => o.id !== id);
    setOffers(updated);
    await saveOffers(updated);
    toast.success("Offer removed permanently");
  }

  // Filter categorization
  const activeOffers = offers.filter(isOfferActive);
  const pausedOffers = offers.filter((o) => !o.isActive && !isOfferExpired(o));
  const historyOffers = offers.filter(isOfferExpired);

  const shown = offers.filter((o) => {
    if (filter === "active") return isOfferActive(o);
    if (filter === "paused") return !o.isActive && !isOfferExpired(o);
    if (filter === "history") return isOfferExpired(o);
    return true;
  });

  return (
    <div className="max-w-6xl pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border/50">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium flex items-center gap-2.5 text-foreground">
            <Gift className="text-accent" size={26} /> Offers, Deals &amp; Discounts
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage time-limited coupons, Buy 2 Get 1 Free offers, automatic validity expiration, and swipe cursor styling.
          </p>
        </div>
        <button
          onClick={() => {
            setModalOpen(true);
            if (!code) generateRandomCode();
          }}
          className="flex items-center gap-2 bg-[#2D1219] hover:bg-black text-white px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus size={14} /> Create New Offer
        </button>
      </div>




      {/* Filter Tabs with Live Counters */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide bg-secondary/50 p-1.5 rounded-2xl border border-border/60 max-w-2xl select-none">
        <button
          onClick={() => setFilter("active")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
            filter === "active"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles size={13} className="text-emerald-600" /> Active in Storefront ({activeOffers.length})
        </button>

        <button
          onClick={() => setFilter("paused")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
            filter === "paused"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Pause size={13} className="text-amber-500" /> Paused ({pausedOffers.length})
        </button>

        <button
          onClick={() => setFilter("history")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
            filter === "history"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Archive size={13} className="text-accent" /> 30-Day History &amp; Archive ({historyOffers.length})
        </button>

        <button
          onClick={() => setFilter("all")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            filter === "all"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({offers.length})
        </button>
      </div>

      {/* Offers Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-accent" /> Loading offers &amp; discount rules...
        </div>
      ) : shown.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-foreground glass-card rounded-3xl border border-dashed border-border p-8">
          {filter === "history"
            ? "No expired coupons in the 30-day history archive."
            : filter === "paused"
            ? "No paused coupons currently."
            : "No active offers found. Click \"+ Create New Offer\" to publish a BOGO or discount coupon!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((offer) => {
            const active = isOfferActive(offer);
            const expired = isOfferExpired(offer);
            const paused = !offer.isActive && !expired;
            const daysLeftInHistory = getDaysRemainingInHistory(offer);

            return (
              <div
                key={offer.id}
                className={`rounded-3xl border p-5 glass-card shadow-xs flex flex-col justify-between transition-all ${
                  active
                    ? "border-accent/40 bg-card/85 ring-1 ring-accent/20"
                    : paused
                    ? "border-amber-500/40 bg-amber-50/10 dark:bg-amber-950/10"
                    : "border-border/60 opacity-85 bg-secondary/20"
                }`}
              >
                <div>
                  {/* Top Badge & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-secondary/90 border border-border/60 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full font-mono text-accent flex items-center gap-1.5">
                      <Tag size={11} /> {offer.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        active
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                          : paused
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                          : "bg-destructive/15 text-destructive border border-destructive/30"
                      }`}
                    >
                      {active ? "Active in Storefront" : paused ? "Paused" : "Expired (Archived)"}
                    </span>
                  </div>

                  {/* Title & Type Description */}
                  <h3 className="font-serif text-base font-semibold text-foreground mb-1">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-muted-foreground mb-3">
                    {offer.type === "bogo"
                      ? `Buy ${offer.buyQty} items, get ${offer.getQty} cheapest item FREE at checkout!`
                      : offer.type === "percentage"
                      ? `Get ${offer.discountValue}% OFF on total cart value!`
                      : `Get Flat ₹${offer.discountValue} OFF on total cart value!`}
                  </p>

                  {/* Validity Info */}
                  <div className="space-y-1.5 bg-secondary/40 rounded-2xl p-3 text-[11px] font-mono text-muted-foreground mb-4 border border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-accent" /> Validity Duration:
                      </span>
                      <span className="font-semibold text-foreground">{offer.durationHours}h</span>
                    </div>
                    {offer.endDate && (
                      <div className="flex items-center justify-between">
                        <span>{expired ? "Expired on:" : "Expires at:"}</span>
                        <span className="font-medium text-foreground">{new Date(offer.endDate).toLocaleDateString()} {new Date(offer.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                    {expired && (
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-amber-600 dark:text-amber-400 font-sans font-medium">
                        <span className="flex items-center gap-1">
                          <AlertTriangle size={11} /> 30-Day Retention:
                        </span>
                        <span>Auto-deletes in {daysLeftInHistory} days</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {expired ? (
                      <button
                        type="button"
                        onClick={() => setExtendModalOffer(offer)}
                        className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw size={11} /> Reactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => togglePause(offer)}
                        className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                          offer.isActive
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                        }`}
                      >
                        {offer.isActive ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Resume</>}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setHistoryModalOffer(offer)}
                      className="p-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="View Coupon History Log"
                    >
                      <History size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(offer.code);
                        toast.success(`Coupon code "${offer.code}" copied!`);
                      }}
                      className="p-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Copy Code"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOffer(offer.id)}
                      className="p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors cursor-pointer"
                      title="Delete Offer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reactivate / Extend Validity Modal ── */}
      {extendModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-serif text-lg font-medium">Reactivate Coupon: {extendModalOffer.code}</h3>
              <button
                onClick={() => setExtendModalOffer(null)}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select how many hours this coupon should remain active in the storefront starting from now.
            </p>

            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1.5">
                New Validity Duration (Hours)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[24, 48, 72, 168].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setExtendHours(h)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      extendHours === h
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-secondary/50 border-border hover:bg-secondary"
                    }`}
                  >
                    {h < 168 ? `${h}h` : "7 Days"}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                value={extendHours}
                onChange={(e) => setExtendHours(Math.max(1, Number(e.target.value)))}
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-xs outline-none border border-border focus:border-accent font-mono"
                placeholder="Custom hours"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setExtendModalOffer(null)}
                className="px-4 py-2 rounded-full border border-border text-xs hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtendValidity}
                className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                Publish &amp; Reactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Coupon History Log Modal ── */}
      {historyModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium">History Log: {historyModalOffer.code}</h3>
                <p className="text-[11px] text-muted-foreground">{historyModalOffer.title}</p>
              </div>
              <button
                onClick={() => setHistoryModalOffer(null)}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {historyModalOffer.history && historyModalOffer.history.length > 0 ? (
                historyModalOffer.history.map((h, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-secondary/40 border border-border/40 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <span className="uppercase font-bold text-accent">{h.action}</span>
                      <span>{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    {h.note && <p className="text-foreground">{h.note}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No action log available for this coupon.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create Offer Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-serif text-xl font-medium">Create New Offer / Deal</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1.5">
                  Offer Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buy 2 Get 1 Free (Monsoon Special)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-xs outline-none border border-border focus:border-accent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Coupon Code
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[10px] uppercase font-bold text-accent hover:underline cursor-pointer"
                  >
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. B2G1, SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-xs outline-none border border-border focus:border-accent font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1.5">
                  Offer Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "bogo", label: "Buy X Get Y Free" },
                    { id: "percentage", label: "% Percentage" },
                    { id: "fixed", label: "Flat ₹ Off" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as OfferType)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        type === t.id
                          ? "bg-accent text-accent-foreground border-accent shadow-xs"
                          : "bg-secondary/40 border-border hover:bg-secondary/70 text-muted-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {type === "bogo" && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-secondary/30 border border-border/60">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                      Buy Quantity (X)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={buyQty}
                      onChange={(e) => setBuyQty(Number(e.target.value))}
                      className="w-full bg-background rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none border border-border"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
                      Get Free Quantity (Y)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={getQty}
                      onChange={(e) => setGetQty(Number(e.target.value))}
                      className="w-full bg-background rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none border border-border"
                    />
                  </div>
                </div>
              )}

              {type !== "bogo" && (
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1.5">
                    {type === "percentage" ? "Discount Percentage (%)" : "Discount Amount (₹)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-xs font-mono font-bold outline-none border border-border focus:border-accent"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1.5">
                  Validity Duration (Hours)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[24, 48, 72, 720].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDurationHours(h)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        durationHours === h
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-secondary/40 border-border hover:bg-secondary"
                      }`}
                    >
                      {h === 720 ? "30 Days" : `${h}h`}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full bg-secondary/50 rounded-xl px-4 py-2 text-xs outline-none border border-border focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1.5">
                  Minimum Order Value (₹) — 0 for none
                </label>
                <input
                  type="number"
                  min={0}
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-xs font-mono outline-none border border-border focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-border text-xs hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#2D1219] hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Creating..." : "Publish Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
