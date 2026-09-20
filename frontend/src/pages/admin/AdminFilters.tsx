import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  SlidersHorizontal,
  Tag,
  ArrowUpDown,
  Percent,
  Sparkles,
  Box,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  ExternalLink,
  Save,
  Layers,
  Zap,
} from "lucide-react";
import {
  DEFAULT_FILTER_CONFIG,
  type FilterConfig,
  type PricePreset,
  type SortOption,
  type OccasionOption,
  type DiscountOption,
} from "@/components/shop/ProductFilters";
import { Link } from "react-router-dom";

export default function AdminFilters() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"price" | "sort" | "occasion" | "discount" | "general">("price");
  const [busy, setBusy] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-products-prices"],
    queryFn: async () => (await supabase.from("products").select("id, price, name")).data ?? [],
  });

  const catalogPriceStats = useMemo(() => {
    if (!productsData?.length) return { min: 0, max: 5000, count: 0 };
    const prices = productsData.map((p) => p.price).filter((p) => typeof p === "number" && !isNaN(p));
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 5000,
      count: productsData.length,
    };
  }, [productsData]);

  const [config, setConfig] = useState<FilterConfig>(DEFAULT_FILTER_CONFIG);

  useEffect(() => {
    if (settings?.theme && (settings.theme as any).filter_config) {
      const saved = (settings.theme as any).filter_config;
      setConfig({
        ...DEFAULT_FILTER_CONFIG,
        ...saved,
        sortOptions: saved.sortOptions?.length ? saved.sortOptions : DEFAULT_FILTER_CONFIG.sortOptions,
        pricePresets: saved.pricePresets?.length ? saved.pricePresets : DEFAULT_FILTER_CONFIG.pricePresets,
        occasionOptions: saved.occasionOptions?.length ? saved.occasionOptions : DEFAULT_FILTER_CONFIG.occasionOptions,
        discountOptions: saved.discountOptions?.length ? saved.discountOptions : DEFAULT_FILTER_CONFIG.discountOptions,
      });
    }
  }, [settings]);

  // Save Configuration
  async function handleSave() {
    setBusy(true);
    try {
      const currentTheme = (settings?.theme as any) || {};
      const updatedTheme = {
        ...currentTheme,
        filter_config: config,
      };

      const { error } = await supabase
        .from("site_settings")
        .update({ theme: updatedTheme })
        .eq("id", 1);

      if (error) throw error;
      toast.success("Filter configuration saved & updated live!");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save filter settings");
    } finally {
      setBusy(false);
    }
  }

  // Restore Defaults
  function handleRestoreDefaults() {
    if (window.confirm("Reset all filter options and presets back to factory defaults?")) {
      setConfig(DEFAULT_FILTER_CONFIG);
      toast.info("Reset to default layout. Click 'Save' to apply.");
    }
  }

  // Price Preset Handlers
  function addPricePreset() {
    const newPreset: PricePreset = {
      id: Date.now().toString(),
      label: "Custom Range",
      minPrice: 500,
      maxPrice: 1500,
      enabled: true,
    };
    setConfig({ ...config, pricePresets: [...(config.pricePresets ?? []), newPreset] });
  }

  function updatePricePreset(id: string, updates: Partial<PricePreset>) {
    setConfig({
      ...config,
      pricePresets: (config.pricePresets ?? []).map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  }

  function deletePricePreset(id: string) {
    setConfig({
      ...config,
      pricePresets: (config.pricePresets ?? []).filter((p) => p.id !== id),
    });
  }

  // Occasion Handlers
  function addOccasion() {
    const newOccasion: OccasionOption = {
      id: Date.now().toString(),
      key: "new-style",
      label: "New Occasion",
      enabled: true,
    };
    setConfig({ ...config, occasionOptions: [...(config.occasionOptions ?? []), newOccasion] });
  }

  function updateOccasion(id: string, updates: Partial<OccasionOption>) {
    setConfig({
      ...config,
      occasionOptions: (config.occasionOptions ?? []).map((o) => (o.id === id ? { ...o, ...updates } : o)),
    });
  }

  function deleteOccasion(id: string) {
    setConfig({
      ...config,
      occasionOptions: (config.occasionOptions ?? []).filter((o) => o.id !== id),
    });
  }

  // Discount Handlers
  function addDiscount() {
    const newDisc: DiscountOption = {
      id: Date.now().toString(),
      value: 40,
      label: "40% & Above",
      enabled: true,
    };
    setConfig({ ...config, discountOptions: [...(config.discountOptions ?? []), newDisc] });
  }

  function updateDiscount(id: string, updates: Partial<DiscountOption>) {
    setConfig({
      ...config,
      discountOptions: (config.discountOptions ?? []).map((d) => (d.id === id ? { ...d, ...updates } : d)),
    });
  }

  function deleteDiscount(id: string) {
    setConfig({
      ...config,
      discountOptions: (config.discountOptions ?? []).filter((d) => d.id !== id),
    });
  }

  const inputClass =
    "w-full bg-secondary/60 rounded-xl px-3 py-2 text-xs outline-none border border-border/40 focus:border-accent";

  return (
    <div className="max-w-4xl pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl mb-1">Filters & Sorting Manager</h1>
          <p className="text-xs text-muted-foreground">
            Fully customize storefront filter categories, price sliders, presets, labels, and sorting options.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/shop"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            <span>Live Preview</span>
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={handleSave}
            disabled={busy}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2 rounded-full text-xs uppercase tracking-widest font-semibold shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save size={14} />
            <span>{busy ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("price")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "price"
              ? "bg-accent text-accent-foreground shadow-sm font-semibold"
              : "bg-secondary/50 text-foreground hover:bg-secondary"
          }`}
        >
          <Tag size={14} />
          <span>Price Range & Presets</span>
        </button>

        <button
          onClick={() => setActiveTab("sort")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "sort"
              ? "bg-accent text-accent-foreground shadow-sm font-semibold"
              : "bg-secondary/50 text-foreground hover:bg-secondary"
          }`}
        >
          <ArrowUpDown size={14} />
          <span>Sort Options</span>
        </button>

        <button
          onClick={() => setActiveTab("occasion")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "occasion"
              ? "bg-accent text-accent-foreground shadow-sm font-semibold"
              : "bg-secondary/50 text-foreground hover:bg-secondary"
          }`}
        >
          <Sparkles size={14} />
          <span>Occasions & Tags</span>
        </button>

        <button
          onClick={() => setActiveTab("discount")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "discount"
              ? "bg-accent text-accent-foreground shadow-sm font-semibold"
              : "bg-secondary/50 text-foreground hover:bg-secondary"
          }`}
        >
          <Percent size={14} />
          <span>Discounts & Offers</span>
        </button>

        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === "general"
              ? "bg-accent text-accent-foreground shadow-sm font-semibold"
              : "bg-secondary/50 text-foreground hover:bg-secondary"
          }`}
        >
          <Layers size={14} />
          <span>Labels & Toggles</span>
        </button>
      </div>

      {/* TAB 1: PRICE RANGES */}
      {activeTab === "price" && (
        <div className="space-y-6">
          {/* 1. Toggle & Info */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Enable Price Filter</h3>
                <p className="text-xs text-muted-foreground">
                  Display dynamic price range slider with custom min/max inputs to customers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.enablePrice}
                onChange={(e) => setConfig({ ...config, enablePrice: e.target.checked })}
                className="w-5 h-5 accent-accent cursor-pointer"
              />
            </div>
          </div>

          {/* 2. Structured Min & Max Price Bounds Card */}
          <div className="glass-card rounded-2xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Tag size={16} className="text-accent" />
                  <span>Storefront Price Slider Boundaries</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set the lower (Min) and upper (Max) boundaries for the storefront price slider. Customers can drag the slider or type any custom amount within this range.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground">Catalog Stats:</span>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border/60">
                  ₹{catalogPriceStats.min} – ₹{catalogPriceStats.max} ({catalogPriceStats.count} items)
                </span>
              </div>
            </div>

            {/* Structured Inputs */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest text-foreground font-bold flex items-center gap-1.5">
                    <span>Minimum Price Boundary (Floor)</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {config.customMinPrice != null ? `Set: ₹${config.customMinPrice}` : "Auto: Default ₹0 / min"}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={config.customMinPrice ?? ""}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setConfig({
                        ...config,
                        customMinPrice: val === "" ? null : Math.max(0, Number(val)),
                      });
                    }}
                    placeholder={`e.g. 0 or ${catalogPriceStats.min}`}
                    className="w-full bg-background rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono font-semibold border border-border/80 focus:border-accent outline-none"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Lowest possible price on the storefront slider. Leave blank to auto-detect from product catalog.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest text-foreground font-bold flex items-center gap-1.5">
                    <span>Maximum Price Boundary (Ceiling)</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {config.customMaxPrice != null ? `Set: ₹${config.customMaxPrice}` : `Auto: ₹${catalogPriceStats.max}`}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={config.customMinPrice ?? 0}
                    value={config.customMaxPrice ?? ""}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setConfig({
                        ...config,
                        customMaxPrice: val === "" ? null : Math.max(0, Number(val)),
                      });
                    }}
                    placeholder={`e.g. 5000 or ${catalogPriceStats.max}`}
                    className="w-full bg-background rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono font-semibold border border-border/80 focus:border-accent outline-none"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Highest possible price on the storefront slider. Leave blank to auto-detect highest product price.
                </p>
              </div>
            </div>

            {/* Quick Action Presets */}
            <div className="pt-1">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
                ⚡ Quick Presets
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      customMinPrice: catalogPriceStats.min,
                      customMaxPrice: catalogPriceStats.max,
                    })
                  }
                  className="px-3 py-1.5 rounded-full text-xs bg-secondary/80 hover:bg-secondary text-foreground border border-border/60 font-medium transition-all"
                >
                  🎯 Exact Catalog Range (₹{catalogPriceStats.min} – ₹{catalogPriceStats.max})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      customMinPrice: 0,
                      customMaxPrice: 5000,
                    })
                  }
                  className="px-3 py-1.5 rounded-full text-xs bg-secondary/80 hover:bg-secondary text-foreground border border-border/60 font-medium transition-all"
                >
                  💎 Standard (₹0 – ₹5,000)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      customMinPrice: 0,
                      customMaxPrice: 10000,
                    })
                  }
                  className="px-3 py-1.5 rounded-full text-xs bg-secondary/80 hover:bg-secondary text-foreground border border-border/60 font-medium transition-all"
                >
                  👑 Luxury Range (₹0 – ₹10,000)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      customMinPrice: null,
                      customMaxPrice: null,
                    })
                  }
                  className="px-3 py-1.5 rounded-full text-xs bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 font-medium transition-all"
                >
                  🔄 Auto Dynamic (Clear Manual Bounds)
                </button>
              </div>
            </div>

            {/* Live Interactive Storefront Slider Preview */}
            <div className="mt-4 p-4 rounded-xl border border-accent/30 bg-accent/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                  <Zap size={14} />
                  <span>Real-Time Storefront Slider Preview</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  (How it looks on customer mobile & desktop)
                </span>
              </div>

              {(() => {
                const effectiveMin = config.customMinPrice ?? catalogPriceStats.min ?? 0;
                const effectiveMax = Math.max(effectiveMin + 1, config.customMaxPrice ?? catalogPriceStats.max ?? 5000);
                return (
                  <div className="p-4 rounded-xl bg-background border border-border/60 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="px-2.5 py-1 rounded-md bg-secondary font-mono">
                        ₹{effectiveMin.toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted-foreground font-normal text-[11px]">← Dynamic Slider →</span>
                      <span className="px-2.5 py-1 rounded-md bg-secondary font-mono">
                        ₹{effectiveMax.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={effectiveMin}
                      max={effectiveMax}
                      defaultValue={effectiveMax}
                      className="w-full accent-accent cursor-pointer"
                      disabled
                    />

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Storefront Filter Range: <strong className="text-foreground">₹{effectiveMin.toLocaleString("en-IN")}</strong> to <strong className="text-foreground">₹{effectiveMax.toLocaleString("en-IN")}</strong></span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Check size={12} /> Active & Ready
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SORT OPTIONS */}
      {activeTab === "sort" && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h3 className="text-sm font-semibold">Product Sorting Options</h3>
              <p className="text-xs text-muted-foreground">
                Customize titles, descriptions, and visibility of sorting options in the filter drawer.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.enableSort}
              onChange={(e) => setConfig({ ...config, enableSort: e.target.checked })}
              className="w-5 h-5 accent-accent cursor-pointer"
            />
          </div>

          <div className="space-y-3">
            {(config.sortOptions ?? []).map((sort, i) => (
              <div
                key={sort.key}
                className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={sort.enabled}
                    onChange={(e) => {
                      const copy = [...(config.sortOptions ?? [])];
                      copy[i].enabled = e.target.checked;
                      setConfig({ ...config, sortOptions: copy });
                    }}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      value={sort.label}
                      onChange={(e) => {
                        const copy = [...(config.sortOptions ?? [])];
                        copy[i].label = e.target.value;
                        setConfig({ ...config, sortOptions: copy });
                      }}
                      className="bg-background rounded-lg px-2.5 py-1 text-xs font-medium border border-border/60 w-full"
                    />
                    <input
                      value={sort.description}
                      onChange={(e) => {
                        const copy = [...(config.sortOptions ?? [])];
                        copy[i].description = e.target.value;
                        setConfig({ ...config, sortOptions: copy });
                      }}
                      placeholder="Help text for customer"
                      className="bg-background/60 rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground border border-border/40 w-full"
                    />
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono bg-secondary px-2 py-1 rounded">
                  {sort.key}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OCCASIONS & STYLES */}
      {activeTab === "occasion" && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h3 className="text-sm font-semibold">Occasion & Style Tags</h3>
              <p className="text-xs text-muted-foreground">
                Matches product tags or descriptions (e.g. Daily Wear, Party, Wedding).
              </p>
            </div>
            <button
              onClick={addOccasion}
              className="flex items-center gap-1 bg-accent/15 text-accent hover:bg-accent/25 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            >
              <Plus size={14} />
              <span>Add Occasion</span>
            </button>
          </div>

          <div className="space-y-3">
            {(config.occasionOptions ?? []).map((o) => (
              <div
                key={o.id}
                className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 flex items-center gap-3 justify-between"
              >
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={o.enabled}
                    onChange={(e) => updateOccasion(o.id, { enabled: e.target.checked })}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <input
                    value={o.label}
                    onChange={(e) => updateOccasion(o.id, { label: e.target.value })}
                    placeholder="Display Title (e.g. Daily Wear)"
                    className="bg-background rounded-lg px-2.5 py-1.5 text-xs font-medium border border-border/60 flex-1"
                  />
                  <input
                    value={o.key}
                    onChange={(e) => updateOccasion(o.id, { key: e.target.value })}
                    placeholder="Tag key (e.g. daily)"
                    className="bg-background/60 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground border border-border/40 w-32"
                  />
                </div>
                <button
                  onClick={() => deleteOccasion(o.id)}
                  className="p-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISCOUNTS & OFFERS */}
      {activeTab === "discount" && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h3 className="text-sm font-semibold">Discount Thresholds</h3>
              <p className="text-xs text-muted-foreground">
                Filter products with compare_at_price savings (e.g. 10% & Above, 20% & Above).
              </p>
            </div>
            <button
              onClick={addDiscount}
              className="flex items-center gap-1 bg-accent/15 text-accent hover:bg-accent/25 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            >
              <Plus size={14} />
              <span>Add Discount Tier</span>
            </button>
          </div>

          <div className="space-y-3">
            {(config.discountOptions ?? []).map((d) => (
              <div
                key={d.id}
                className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 flex items-center gap-3 justify-between"
              >
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={d.enabled}
                    onChange={(e) => updateDiscount(d.id, { enabled: e.target.checked })}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <input
                    value={d.label}
                    onChange={(e) => updateDiscount(d.id, { label: e.target.value })}
                    placeholder="Display Name (e.g. 10% & Above)"
                    className="bg-background rounded-lg px-2.5 py-1.5 text-xs font-medium border border-border/60 flex-1"
                  />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Min %</span>
                    <input
                      type="number"
                      value={d.value}
                      onChange={(e) => updateDiscount(d.id, { value: Number(e.target.value) })}
                      className="bg-background rounded-lg px-2 py-1.5 text-xs border border-border/60 w-16 text-center"
                    />
                  </div>
                </div>
                <button
                  onClick={() => deleteDiscount(d.id)}
                  className="p-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GENERAL & LABELS */}
      {activeTab === "general" && (
        <div className="glass-card rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-semibold">Storefront Trigger & Heading Copy</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                Trigger Button Text
              </label>
              <input
                value={config.triggerButtonText ?? "Filters & Sort"}
                onChange={(e) => setConfig({ ...config, triggerButtonText: e.target.value })}
                placeholder="Filters & Sort"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                Filter Drawer Heading
              </label>
              <input
                value={config.drawerTitle ?? "Filters & Sorting"}
                onChange={(e) => setConfig({ ...config, drawerTitle: e.target.value })}
                placeholder="Filters & Sorting"
                className={inputClass}
              />
            </div>

            <div className="pt-2 border-t border-border/40">
              <label className="flex items-center justify-between text-xs cursor-pointer py-1">
                <span>Stock / Availability Status Filter</span>
                <input
                  type="checkbox"
                  checked={config.enableAvailability}
                  onChange={(e) => setConfig({ ...config, enableAvailability: e.target.checked })}
                  className="w-4 h-4 accent-accent rounded"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/60">
        <button
          type="button"
          onClick={handleRestoreDefaults}
          className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors"
        >
          <RotateCcw size={13} />
          <span>Reset All Defaults</span>
        </button>

        <button
          onClick={handleSave}
          disabled={busy}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save size={14} />
          <span>{busy ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}
