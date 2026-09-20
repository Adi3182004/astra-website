import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, X, Check, ArrowUpDown, Tag, Percent, Sparkles, Box, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/settings";
import type { ProductCardData } from "@/components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

export type SortKey = "latest" | "low" | "high" | "name";
export type Availability = "all" | "in" | "out";

export type FilterState = {
  sort: SortKey;
  availability: Availability;
  maxPrice: number | null;
  minPrice: number | null;
  minDiscount: number | null;
  occasion: string | null;
};

export const DEFAULT_FILTERS: FilterState = {
  sort: "latest",
  availability: "all",
  maxPrice: null,
  minPrice: null,
  minDiscount: null,
  occasion: null,
};

export type PricePreset = {
  id: string;
  label: string;
  minPrice: number | null;
  maxPrice: number | null;
  enabled: boolean;
};

export type SortOption = {
  key: SortKey;
  label: string;
  description: string;
  enabled: boolean;
};

export type OccasionOption = {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
};

export type DiscountOption = {
  id: string;
  value: number;
  label: string;
  enabled: boolean;
};

export type FilterConfig = {
  enablePrice: boolean;
  enableSort: boolean;
  enableAvailability: boolean;
  enableDiscount: boolean;
  enableOccasion: boolean;
  triggerButtonText?: string;
  drawerTitle?: string;
  sortOptions?: SortOption[];
  pricePresets?: PricePreset[];
  occasionOptions?: OccasionOption[];
  discountOptions?: DiscountOption[];
  customMinPrice?: number | null;
  customMaxPrice?: number | null;
};

export const DEFAULT_FILTER_CONFIG: FilterConfig = {
  enablePrice: true,
  enableSort: true,
  enableAvailability: true,
  enableDiscount: true,
  enableOccasion: true,
  triggerButtonText: "Filters & Sort",
  drawerTitle: "Filters & Sorting",
  sortOptions: [
    { key: "latest", label: "Latest Arrivals", description: "Newest designs first", enabled: true },
    { key: "low", label: "Price: Low to High", description: "Budget friendly first", enabled: true },
    { key: "high", label: "Price: High to Low", description: "Premium luxury first", enabled: true },
    { key: "name", label: "Name: A to Z", description: "Alphabetical order", enabled: true },
  ],
  pricePresets: [],
  occasionOptions: [
    { id: "1", key: "daily", label: "Daily Wear", enabled: true },
    { id: "2", key: "office", label: "Office Wear", enabled: true },
    { id: "3", key: "party", label: "Party & Festive", enabled: true },
    { id: "4", key: "wedding", label: "Bridal & Wedding", enabled: true },
  ],
  discountOptions: [
    { id: "1", value: 10, label: "10% & Above", enabled: true },
    { id: "2", value: 20, label: "20% & Above", enabled: true },
    { id: "3", value: 30, label: "30% & Above", enabled: true },
    { id: "4", value: 50, label: "50% & Above", enabled: true },
  ],
};

const AVAIL: { k: Availability; l: string; desc: string }[] = [
  { k: "all", l: "All Pieces", desc: "Show everything in catalog" },
  { k: "in", l: "In Stock Only", desc: "Ready to ship immediately" },
  { k: "out", l: "Sold Out / Archived", desc: "Past & archived collection" },
];

/** Applies the filter state to a product list with reliable logical matching. */
export function applyFilters(items: ProductCardData[], f: FilterState) {
  const out = items.filter((p) => {
    const sold = p.out_of_stock || (p.stock ?? 0) <= 0;
    if (f.availability === "in" && sold) return false;
    if (f.availability === "out" && !sold) return false;
    if (f.minPrice != null && p.price < f.minPrice) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;

    if (f.minDiscount != null) {
      const cmp = Number(p.compare_at_price || 0);
      const prc = Number(p.price || 0);
      if (cmp <= prc) return false;
      const discount = Math.round(((cmp - prc) / cmp) * 100);
      if (discount < f.minDiscount) return false;
    }

    if (f.occasion) {
      const targetOccasion = f.occasion.toLowerCase().trim();
      const prodOccasion = ((p.text_style as any)?.occasion || (p as any).occasion || "daily").toLowerCase().trim();
      
      const tags = ((p as any).tags ?? []).map((t: string) => t.toLowerCase().trim());
      const name = p.name.toLowerCase();
      const desc = ((p as any).description ?? "").toLowerCase();

      if (targetOccasion === "daily") {
        const isDaily = prodOccasion === "daily" || !prodOccasion || tags.includes("daily") || name.includes("daily");
        if (!isDaily && (prodOccasion === "office" || prodOccasion === "party" || prodOccasion === "wedding")) {
          return false;
        }
      } else {
        const match =
          prodOccasion === targetOccasion ||
          tags.includes(targetOccasion) ||
          name.includes(targetOccasion) ||
          desc.includes(targetOccasion);
        if (!match) return false;
      }
    }

    return true;
  });

  return out.sort((a, b) => {
    if (f.sort === "low") return a.price - b.price;
    if (f.sort === "high") return b.price - a.price;
    if (f.sort === "name") return a.name.localeCompare(b.name);
    if (f.sort === "latest") {
      if ((a as any).created_at && (b as any).created_at) {
        return +new Date((b as any).created_at) - +new Date((a as any).created_at);
      }
      return ((a as any).sort_order ?? 0) - ((b as any).sort_order ?? 0);
    }
    return 0;
  });
}

export function ProductFilters({
  items,
  value,
  onChange,
  count,
  config = DEFAULT_FILTER_CONFIG,
}: {
  items: ProductCardData[];
  value: FilterState;
  onChange: (f: FilterState) => void;
  count: number;
  config?: FilterConfig;
}) {
  const mergedConfig: FilterConfig = {
    ...DEFAULT_FILTER_CONFIG,
    ...config,
    sortOptions: config?.sortOptions?.length ? config.sortOptions : DEFAULT_FILTER_CONFIG.sortOptions,
    pricePresets: config?.pricePresets?.length ? config.pricePresets : DEFAULT_FILTER_CONFIG.pricePresets,
    occasionOptions: config?.occasionOptions?.length ? config.occasionOptions : DEFAULT_FILTER_CONFIG.occasionOptions,
    discountOptions: config?.discountOptions?.length ? config.discountOptions : DEFAULT_FILTER_CONFIG.discountOptions,
  };

  const activeSortOptions = (mergedConfig.sortOptions ?? []).filter((s) => s.enabled);
  const activePricePresets = (mergedConfig.pricePresets ?? []).filter((p) => p.enabled);
  const activeOccasions = (mergedConfig.occasionOptions ?? []).filter((o) => o.enabled);
  const activeDiscounts = (mergedConfig.discountOptions ?? []).filter((d) => d.enabled);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"sort" | "price" | "avail" | "discount" | "occasion">("sort");
  const [draft, setDraft] = useState<FilterState>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const [floor, ceil] = useMemo(() => {
    const rawMin = mergedConfig.customMinPrice != null && !isNaN(Number(mergedConfig.customMinPrice)) ? Number(mergedConfig.customMinPrice) : null;
    const rawMax = mergedConfig.customMaxPrice != null && !isNaN(Number(mergedConfig.customMaxPrice)) ? Number(mergedConfig.customMaxPrice) : null;

    if (!items.length) return [rawMin ?? 0, rawMax ?? 5000];
    const prices = items.map((p) => Number(p.price)).filter((p) => !isNaN(p));
    const min = rawMin ?? (prices.length ? Math.floor(Math.min(...prices)) : 0);
    const max = rawMax ?? (prices.length ? Math.ceil(Math.max(...prices)) : 5000);
    return [Math.max(0, min), Math.max(min + 1, max)];
  }, [items, mergedConfig.customMinPrice, mergedConfig.customMaxPrice]);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (value.sort !== "latest") c++;
    if (value.availability !== "all") c++;
    if (value.minPrice != null || value.maxPrice != null) c++;
    if (value.minDiscount != null) c++;
    if (value.occasion != null) c++;
    return c;
  }, [value]);

  function handleApply() {
    onChange(draft);
    setIsOpen(false);
  }

  function handleClear() {
    setDraft(DEFAULT_FILTERS);
    onChange(DEFAULT_FILTERS);
  }

  const previewCount = useMemo(() => {
    return applyFilters(items, draft).length;
  }, [items, draft]);

  return (
    <>
      {/* 1. Sleek Storefront Trigger Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 py-2 px-1 border-b border-border/40">
        <div className="flex items-center gap-2">
          {/* Main Filter & Sort Trigger Button */}
          <button
            onClick={() => {
              setDraft(value);
              setIsOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary/80 hover:bg-secondary text-foreground rounded-full text-xs uppercase tracking-widest border border-border/60 transition-all active:scale-95 shadow-sm"
          >
            <SlidersHorizontal size={14} className="text-accent" />
            <span>{mergedConfig.triggerButtonText || "Filters & Sort"}</span>
            {activeFilterCount > 0 && (
              <span className="bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-[11px] uppercase tracking-wider text-muted-foreground ml-1">
            {count} {count === 1 ? "piece" : "pieces"}
          </span>
        </div>

        {/* Active Filter Chips with Quick-Remove */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {value.sort !== "latest" && (
            <button
              onClick={() => onChange({ ...value, sort: "latest" })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[10px] tracking-wide border border-accent/30 hover:bg-accent/25 transition-colors"
            >
              <span>{activeSortOptions.find((s) => s.key === value.sort)?.label || value.sort}</span>
              <X size={11} />
            </button>
          )}

          {(value.minPrice != null || value.maxPrice != null) && (
            <button
              onClick={() => onChange({ ...value, minPrice: null, maxPrice: null })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[10px] tracking-wide border border-accent/30 hover:bg-accent/25 transition-colors"
            >
              <span>
                {value.minPrice != null && value.maxPrice != null
                  ? `${formatPrice(value.minPrice)} – ${formatPrice(value.maxPrice)}`
                  : value.maxPrice != null
                  ? `Under ${formatPrice(value.maxPrice)}`
                  : `Above ${formatPrice(value.minPrice)}`}
              </span>
              <X size={11} />
            </button>
          )}

          {value.availability !== "all" && (
            <button
              onClick={() => onChange({ ...value, availability: "all" })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[10px] tracking-wide border border-accent/30 hover:bg-accent/25 transition-colors"
            >
              <span>{value.availability === "in" ? "In Stock" : "Sold Out"}</span>
              <X size={11} />
            </button>
          )}

          {value.minDiscount != null && (
            <button
              onClick={() => onChange({ ...value, minDiscount: null })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[10px] tracking-wide border border-accent/30 hover:bg-accent/25 transition-colors"
            >
              <span>{value.minDiscount}%+ Off</span>
              <X size={11} />
            </button>
          )}

          {value.occasion != null && (
            <button
              onClick={() => onChange({ ...value, occasion: null })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[10px] tracking-wide border border-accent/30 hover:bg-accent/25 transition-colors"
            >
              <span>{activeOccasions.find((o) => o.key === value.occasion)?.label ?? value.occasion}</span>
              <X size={11} />
            </button>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground ml-1 underline decoration-dotted"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* 2. Flipkart / Myntra Style Vertical Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm"
            />

            {/* Slide-out Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-background h-full h-[100dvh] shadow-2xl flex flex-col z-10 border-l border-border/60"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-secondary/30">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-accent" />
                  <h2 className="font-serif text-lg font-medium tracking-wide">
                    {mergedConfig.drawerTitle || "Filters & Sorting"}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDraft(DEFAULT_FILTERS)}
                    className="text-xs uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full text-foreground/70 hover:text-foreground hover:bg-secondary/60 transition-colors"
                    aria-label="Close filters"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Flipkart Style 2-Column Split Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left Facet Navigation Column */}
                <div className="w-1/3 border-r border-border/60 bg-secondary/20 overflow-y-auto">
                  {mergedConfig.enableSort && (
                    <button
                      onClick={() => setActiveTab("sort")}
                      className={`w-full text-left px-3 py-3.5 text-xs font-medium border-b border-border/40 transition-colors flex items-center justify-between ${
                        activeTab === "sort"
                          ? "bg-background text-accent border-l-2 border-l-accent font-semibold"
                          : "text-foreground/80 hover:bg-secondary/40"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowUpDown size={13} />
                        <span>Sort By</span>
                      </span>
                      {draft.sort !== "latest" && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </button>
                  )}

                  {mergedConfig.enablePrice && (
                    <button
                      onClick={() => setActiveTab("price")}
                      className={`w-full text-left px-3 py-3.5 text-xs font-medium border-b border-border/40 transition-colors flex items-center justify-between ${
                        activeTab === "price"
                          ? "bg-background text-accent border-l-2 border-l-accent font-semibold"
                          : "text-foreground/80 hover:bg-secondary/40"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag size={13} />
                        <span>Price</span>
                      </span>
                      {(draft.minPrice != null || draft.maxPrice != null) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </button>
                  )}

                  {mergedConfig.enableAvailability && (
                    <button
                      onClick={() => setActiveTab("avail")}
                      className={`w-full text-left px-3 py-3.5 text-xs font-medium border-b border-border/40 transition-colors flex items-center justify-between ${
                        activeTab === "avail"
                          ? "bg-background text-accent border-l-2 border-l-accent font-semibold"
                          : "text-foreground/80 hover:bg-secondary/40"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Box size={13} />
                        <span>Stock</span>
                      </span>
                      {draft.availability !== "all" && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </button>
                  )}

                  {mergedConfig.enableDiscount && (
                    <button
                      onClick={() => setActiveTab("discount")}
                      className={`w-full text-left px-3 py-3.5 text-xs font-medium border-b border-border/40 transition-colors flex items-center justify-between ${
                        activeTab === "discount"
                          ? "bg-background text-accent border-l-2 border-l-accent font-semibold"
                          : "text-foreground/80 hover:bg-secondary/40"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Percent size={13} />
                        <span>Discount</span>
                      </span>
                      {draft.minDiscount != null && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </button>
                  )}

                  {mergedConfig.enableOccasion && (
                    <button
                      onClick={() => setActiveTab("occasion")}
                      className={`w-full text-left px-3 py-3.5 text-xs font-medium border-b border-border/40 transition-colors flex items-center justify-between ${
                        activeTab === "occasion"
                          ? "bg-background text-accent border-l-2 border-l-accent font-semibold"
                          : "text-foreground/80 hover:bg-secondary/40"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={13} />
                        <span>Occasion</span>
                      </span>
                      {draft.occasion != null && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </button>
                  )}
                </div>

                {/* Right Options Details Column */}
                <div className="w-2/3 p-4 overflow-y-auto">
                  {/* SORT BY OPTIONS */}
                  {activeTab === "sort" && (
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                        Sort Products
                      </p>
                      {activeSortOptions.map((s) => (
                        <label
                          key={s.key}
                          onClick={() => setDraft({ ...draft, sort: s.key })}
                          className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            draft.sort === s.key
                              ? "border-accent bg-accent/10 text-foreground"
                              : "border-border/60 hover:bg-secondary/40 text-foreground/80"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-medium">{s.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                              draft.sort === s.key ? "border-accent bg-accent text-accent-foreground" : "border-border"
                            }`}
                          >
                            {draft.sort === s.key && <Check size={10} strokeWidth={3} />}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* PRICE RANGE OPTIONS */}
                  {activeTab === "price" && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 font-semibold">
                          Price Range Filter
                        </p>
                        <div className="flex items-center justify-between text-xs font-medium text-foreground mb-2">
                          <span>{formatPrice(draft.minPrice ?? floor)}</span>
                          <span>{formatPrice(draft.maxPrice ?? ceil)}</span>
                        </div>
                        <input
                          type="range"
                          min={floor}
                          max={ceil}
                          step={Math.max(1, Math.round((ceil - floor) / 40))}
                          value={draft.maxPrice ?? ceil}
                          onChange={(e) => setDraft({ ...draft, maxPrice: Number(e.target.value) })}
                          className="w-full accent-accent cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                            Min Price (₹)
                          </label>
                          <input
                            type="number"
                            min={floor}
                            max={draft.maxPrice ?? ceil}
                            value={draft.minPrice ?? ""}
                            placeholder={String(floor)}
                            onChange={(e) => {
                              const val = e.target.value === "" ? null : Number(e.target.value);
                              setDraft({ ...draft, minPrice: val });
                            }}
                            className="w-full bg-secondary/60 rounded-xl px-3 py-2 text-xs border border-border/60 outline-none focus:border-accent text-foreground font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                            Max Price (₹)
                          </label>
                          <input
                            type="number"
                            min={draft.minPrice ?? floor}
                            max={ceil}
                            value={draft.maxPrice ?? ""}
                            placeholder={String(ceil)}
                            onChange={(e) => {
                              const val = e.target.value === "" ? null : Number(e.target.value);
                              setDraft({ ...draft, maxPrice: val });
                            }}
                            className="w-full bg-secondary/60 rounded-xl px-3 py-2 text-xs border border-border/60 outline-none focus:border-accent text-foreground font-mono"
                          />
                        </div>
                      </div>

                      {(draft.minPrice != null || draft.maxPrice != null) && (
                        <button
                          type="button"
                          onClick={() => setDraft({ ...draft, minPrice: null, maxPrice: null })}
                          className="text-xs text-accent hover:underline font-medium pt-1"
                        >
                          Reset price to all (₹{floor} – ₹{ceil})
                        </button>
                      )}
                    </div>
                  )}

                  {/* AVAILABILITY OPTIONS */}
                  {activeTab === "avail" && (
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                        Stock Status
                      </p>
                      {AVAIL.map((a) => (
                        <label
                          key={a.k}
                          onClick={() => setDraft({ ...draft, availability: a.k })}
                          className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            draft.availability === a.k
                              ? "border-accent bg-accent/10 text-foreground"
                              : "border-border/60 hover:bg-secondary/40 text-foreground/80"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-medium">{a.l}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                              draft.availability === a.k
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border"
                            }`}
                          >
                            {draft.availability === a.k && <Check size={10} strokeWidth={3} />}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* DISCOUNT OPTIONS */}
                  {activeTab === "discount" && (
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                        Special Offers
                      </p>
                      {activeDiscounts.map((d) => (
                        <label
                          key={d.id}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              minDiscount: draft.minDiscount === d.value ? null : d.value,
                            })
                          }
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            draft.minDiscount === d.value
                              ? "border-accent bg-accent/10 text-foreground"
                              : "border-border/60 hover:bg-secondary/40 text-foreground/80"
                          }`}
                        >
                          <span className="text-xs font-medium">{d.label}</span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              draft.minDiscount === d.value
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border"
                            }`}
                          >
                            {draft.minDiscount === d.value && <Check size={11} strokeWidth={3} />}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* OCCASION OPTIONS */}
                  {activeTab === "occasion" && (
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
                        Style & Wear
                      </p>
                      {activeOccasions.map((o) => (
                        <label
                          key={o.id}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              occasion: draft.occasion === o.key ? null : o.key,
                            })
                          }
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            draft.occasion === o.key
                              ? "border-accent bg-accent/10 text-foreground"
                              : "border-border/60 hover:bg-secondary/40 text-foreground/80"
                          }`}
                        >
                          <span className="text-xs font-medium">{o.label}</span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              draft.occasion === o.key
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border"
                            }`}
                          >
                            {draft.occasion === o.key && <Check size={11} strokeWidth={3} />}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Sticky Bottom Action Bar */}
              <div className="p-4 border-t border-border/60 bg-secondary/30 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 py-3 rounded-full border border-border text-foreground text-xs uppercase tracking-widest hover:bg-secondary/60 transition-colors font-medium"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-[1.5] py-3 rounded-full bg-accent text-accent-foreground text-xs uppercase tracking-widest hover:opacity-90 transition-opacity font-medium shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Apply Filters</span>
                  <span className="text-[10px] opacity-80 font-normal">({previewCount})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
