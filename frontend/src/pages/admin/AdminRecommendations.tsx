import { useEffect, useState, useMemo, useRef } from "react";
import { 
  Sparkles, 
  Check, 
  Loader2, 
  Shuffle, 
  ListOrdered, 
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  ShoppingBag,
  SlidersHorizontal,
  Plus,
  Trash2,
  ChevronRight,
  Eye,
  CheckCircle2,
  CircleDashed,
  RotateCcw,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/settings";
import { 
  fetchRecommendationConfig, 
  saveRecommendationConfig, 
  type RecommendationConfig, 
  type RecommendationItem,
  DEFAULT_RECOMMENDED_ITEMS 
} from "@/lib/recommendations";

export default function AdminRecommendations() {
  const [config, setConfig] = useState<RecommendationConfig>({
    isRandom: true,
    title: "Recommended For You",
    maxDisplayCount: 4,
    customItems: DEFAULT_RECOMMENDED_ITEMS,
    productRules: {},
  });

  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active View Tab: "product-rules" vs "global-cart"
  const [activeTab, setActiveTab] = useState<"product-rules" | "global-cart">("product-rules");

  // Selected Parent Product for recommendation rules
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Filtering & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name-asc">("default");
  const [priceRange, setPriceRange] = useState<number>(10000);

  const previewScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Load recommendation config
      const savedConfig = await fetchRecommendationConfig();

      // 2. Load all live products and categories from Supabase
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, categories(name), product_images(url,sort_order)")
          .order("sort_order", { ascending: true }),
        supabase.from("categories").select("name").order("name")
      ]);

      const fetchedProducts = productsRes.data || [];
      const fetchedCats = (categoriesRes.data || []).map((c: any) => c.name);

      setLiveProducts(fetchedProducts);
      setCategories(fetchedCats);

      // Merge live products into customItems pool if missing
      const existingIds = new Set((savedConfig.customItems || []).map((i) => i.id));
      const newItems: RecommendationItem[] = [...(savedConfig.customItems || [])];

      fetchedProducts.forEach((p) => {
        if (!existingIds.has(p.id)) {
          const imgs = (p.product_images || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
          const primaryImg = imgs[0]?.url || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80";
          const regularPrice = Number(p.price) || 999;
          const origPrice = Number(p.original_price) || regularPrice * 4;

          newItems.push({
            id: p.id,
            name: p.name,
            slug: p.slug || p.id,
            price: regularPrice,
            originalPrice: origPrice,
            discountPct: Math.max(0, Math.round(((origPrice - regularPrice) / origPrice) * 100)) || 75,
            image: primaryImg,
            category: p.categories?.name || "Jewelry",
            isActive: true,
          });
        }
      });

      const finalConfig: RecommendationConfig = {
        ...savedConfig,
        customItems: newItems,
        productRules: savedConfig.productRules || {},
      };

      setConfig(finalConfig);

      // Set initial parent product
      if (fetchedProducts.length > 0) {
        setSelectedParentId(fetchedProducts[0].id);
      } else if (newItems.length > 0) {
        setSelectedParentId(newItems[0].id);
      }
    } catch (e) {
      console.error("Error loading recommendation data:", e);
      toast.error("Failed to load products for recommendations");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const ok = await saveRecommendationConfig(config);
    setSaving(false);
    if (ok) {
      toast.success("Recommendation rules updated & live across your store!");
    } else {
      toast.error("Failed to save recommendations");
    }
  }

  // --- Product-Specific Recommendation Rule Management ---
  const currentAssignedIds = useMemo(() => {
    if (!selectedParentId) return [];
    return config.productRules?.[selectedParentId] || [];
  }, [config.productRules, selectedParentId]);

  const toggleProductRecommendation = (recommendedProductId: string) => {
    if (!selectedParentId) return;

    const currentList = config.productRules?.[selectedParentId] || [];
    const isAlreadyAssigned = currentList.includes(recommendedProductId);

    const updatedList = isAlreadyAssigned
      ? currentList.filter((id) => id !== recommendedProductId)
      : [...currentList, recommendedProductId];

    setConfig((prev) => ({
      ...prev,
      productRules: {
        ...(prev.productRules || {}),
        [selectedParentId]: updatedList,
      },
    }));
  };

  const selectAllRecommendationsForParent = () => {
    if (!selectedParentId) return;
    const allOtherIds = config.customItems
      .filter((i) => i.id !== selectedParentId)
      .map((i) => i.id);

    setConfig((prev) => ({
      ...prev,
      productRules: {
        ...(prev.productRules || {}),
        [selectedParentId]: allOtherIds,
      },
    }));
    toast.success("Selected all products as recommendations!");
  };

  const clearAllRecommendationsForParent = () => {
    if (!selectedParentId) return;
    setConfig((prev) => ({
      ...prev,
      productRules: {
        ...(prev.productRules || {}),
        [selectedParentId]: [],
      },
    }));
    toast.info("Cleared all recommendations for this product");
  };

  const recommendSameCategoryForParent = () => {
    if (!selectedParentId) return;
    const parentItem = config.customItems.find((i) => i.id === selectedParentId);
    if (!parentItem?.category) {
      toast.error("Parent product category not found");
      return;
    }

    const sameCatIds = config.customItems
      .filter((i) => i.id !== selectedParentId && i.category === parentItem.category)
      .map((i) => i.id);

    setConfig((prev) => ({
      ...prev,
      productRules: {
        ...(prev.productRules || {}),
        [selectedParentId]: sameCatIds,
      },
    }));
    toast.success(`Selected ${sameCatIds.length} items from category "${parentItem.category}"`);
  };

  const handleDeleteProductFromRecommendations = (e: React.MouseEvent, productId: string, productName: string) => {
    e.stopPropagation();
    
    // If it's currently recommended for this parent product, unassign/remove it
    if (selectedParentId && currentAssignedIds.includes(productId)) {
      toggleProductRecommendation(productId);
      toast.info(`Removed "${productName}" from recommendations`);
    } else {
      // Remove from catalog and all recommendation rules
      if (confirm(`Are you sure you want to remove "${productName}" from the recommendations list?`)) {
        setConfig((prev) => ({
          ...prev,
          customItems: prev.customItems.filter((i) => i.id !== productId),
          productRules: Object.fromEntries(
            Object.entries(prev.productRules || {}).map(([k, list]) => [
              k,
              list.filter((id) => id !== productId),
            ])
          ),
        }));
        toast.success(`Removed "${productName}" from recommendation catalog`);
      }
    }
  };

  // --- Filtering & Sorting ---
  const filteredCatalog = useMemo(() => {
    let list = [...config.customItems];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || (i.category || "").toLowerCase().includes(q));
    }

    if (selectedCategory !== "all") {
      list = list.filter((i) => (i.category || "").toLowerCase() === selectedCategory.toLowerCase());
    }

    list = list.filter((i) => i.price <= priceRange);

    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [config.customItems, search, selectedCategory, priceRange, sortBy]);

  const selectedParentItem = useMemo(() => {
    return config.customItems.find((i) => i.id === selectedParentId);
  }, [config.customItems, selectedParentId]);

  // Recommended preview list for the currently active parent product
  const currentPreviewRecommendations = useMemo(() => {
    if (!selectedParentId) return [];
    const ids = config.productRules?.[selectedParentId] || [];
    return config.customItems.filter((i) => ids.includes(i.id));
  }, [config.customItems, config.productRules, selectedParentId]);

  return (
    <div className="max-w-6xl pb-24 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border/50">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium flex items-center gap-2.5 text-foreground">
            <Sparkles className="text-accent" size={26} /> Product Recommendations &amp; Upsells
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure which products to recommend when customers view any live product or checkout in their cart.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#2D1219] hover:bg-black text-white px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save Changes
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-muted-foreground flex items-center justify-center gap-2.5">
          <Loader2 size={18} className="animate-spin text-accent" /> Loading live products &amp; recommendations...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Navigation Tabs */}
          <div className="flex gap-2 p-1.5 rounded-2xl bg-secondary/50 border border-border/60 max-w-md">
            <button
              type="button"
              onClick={() => setActiveTab("product-rules")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "product-rules"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers size={14} className="text-accent" /> Product-Specific Rules
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("global-cart")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "global-cart"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag size={14} className="text-accent" /> Global Cart Drawer
            </button>
          </div>

          {activeTab === "product-rules" && (
            <div className="space-y-6">
              {/* Step 1: Select Parent Product */}
              <div className="glass-card rounded-3xl border border-border p-5 bg-card/75 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent block">Step 1</span>
                    <h2 className="font-serif text-lg font-medium text-foreground">Select a Live Product</h2>
                    <p className="text-xs text-muted-foreground">
                      Click any product below to configure its custom recommendations.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full border border-border/60">
                    {config.customItems.length} Products Live
                  </span>
                </div>

                {/* Parent Products Horizontal Swipeable Bar */}
                <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1 select-none">
                  {config.customItems.map((p) => {
                    const isSelected = p.id === selectedParentId;
                    const assignedCount = (config.productRules?.[p.id] || []).length;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedParentId(p.id)}
                        className={`flex-shrink-0 w-44 sm:w-48 text-left rounded-2xl p-2.5 border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-accent/10 border-accent shadow-sm ring-2 ring-accent/30"
                            : "bg-background border-border/70 hover:border-accent/40"
                        }`}
                      >
                        <div>
                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-secondary/30 mb-2 relative">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            {assignedCount > 0 && (
                              <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                                <Check size={10} strokeWidth={3} /> {assignedCount} Recs
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-foreground line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.category || "Jewelry"}</p>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">{formatPrice(p.price)}</span>
                          <span className={`text-[10px] font-semibold ${isSelected ? "text-accent" : "text-muted-foreground"}`}>
                            {isSelected ? "Active Focus" : "Select"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Recommendations Manager for the Selected Parent Product */}
              {selectedParentItem && (
                <div className="glass-card rounded-3xl border border-accent/30 p-5 sm:p-6 bg-card/90 shadow-sm space-y-5">
                  {/* Selected Product Summary & Actions */}
                  <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border shadow-xs shrink-0">
                        <img src={selectedParentItem.image} alt={selectedParentItem.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-accent">Configuring Recommendations For:</span>
                        <h3 className="font-serif text-lg font-semibold text-foreground">{selectedParentItem.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {currentAssignedIds.length === 0 
                            ? "Currently has 0 specific recommendations (shows default category recommendations)"
                            : `Currently recommending ${currentAssignedIds.length} product${currentAssignedIds.length > 1 ? "s" : ""} on this product page & cart`}
                        </p>
                      </div>
                    </div>

                    {/* Quick Selection Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={recommendSameCategoryForParent}
                        className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Zap size={13} className="text-accent" /> Same Category ({selectedParentItem.category || "Jewelry"})
                      </button>
                      <button
                        type="button"
                        onClick={selectAllRecommendationsForParent}
                        className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Check size={13} className="text-emerald-600" /> Select All ({config.customItems.length - 1})
                      </button>
                      <button
                        type="button"
                        onClick={clearAllRecommendationsForParent}
                        className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw size={13} /> Clear All (0)
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      {/* Category Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory("all")}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                            selectedCategory === "all"
                              ? "bg-accent text-accent-foreground shadow-xs"
                              : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          All Categories
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                              selectedCategory.toLowerCase() === cat.toLowerCase()
                                ? "bg-accent text-accent-foreground shadow-xs"
                                : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Search & Sort Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 border border-border/70 rounded-xl px-3 py-1.5 bg-background text-xs">
                          <Search size={13} className="text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent outline-none w-28 sm:w-36 text-xs"
                          />
                        </div>

                        <select
                          value={sortBy}
                          onChange={(e: any) => setSortBy(e.target.value)}
                          className="bg-background border border-border/70 rounded-xl px-2.5 py-1.5 text-xs outline-none cursor-pointer"
                        >
                          <option value="default">Default Order</option>
                          <option value="price-asc">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                          <option value="name-asc">Name A-Z</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Products Grid for Selection (0 to All) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                    {filteredCatalog.map((item) => {
                      if (item.id === selectedParentId) return null; // Don't recommend self
                      const isAssigned = currentAssignedIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleProductRecommendation(item.id)}
                          className={`rounded-2xl border p-2.5 flex flex-col justify-between transition-all cursor-pointer select-none relative group ${
                            isAssigned
                              ? "bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                              : "bg-background border-border/70 hover:border-accent/40"
                          }`}
                        >
                          <div>
                            <div className="w-full aspect-square rounded-xl overflow-hidden bg-secondary/30 mb-2 relative">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              
                              {/* Top-Left Delete / Remove Button */}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteProductFromRecommendations(e, item.id, item.name)}
                                className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-background/90 hover:bg-rose-600 hover:text-white text-muted-foreground flex items-center justify-center shadow-xs transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer z-10"
                                title="Delete from recommendation list"
                              >
                                <Trash2 size={12} />
                              </button>

                              {/* Top-Right Toggle Add/Assigned Indicator */}
                              <span
                                className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-xs transition-transform ${
                                  isAssigned
                                    ? "bg-emerald-600 text-white scale-105"
                                    : "bg-background/80 text-muted-foreground group-hover:scale-105"
                                }`}
                              >
                                {isAssigned ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-foreground line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.category}</p>
                          </div>

                          <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground font-mono">{formatPrice(item.price)}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => handleDeleteProductFromRecommendations(e, item.id, item.name)}
                                className="p-1 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete from recommendation list"
                              >
                                <Trash2 size={13} />
                              </button>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isAssigned
                                    ? "bg-emerald-600 text-white"
                                    : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                {isAssigned ? "Recommended ✓" : "+ Add"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Swipeable Preview for this Product */}
                  {currentPreviewRecommendations.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-border/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Eye size={14} className="text-accent" /> Live Customer Storefront Preview ({currentPreviewRecommendations.length} items swipeable):
                        </span>
                      </div>

                      <div 
                        ref={previewScrollRef}
                        className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1 select-none"
                      >
                        {currentPreviewRecommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="flex-shrink-0 w-36 sm:w-44 rounded-xl border border-border/70 bg-background p-2.5 shadow-xs relative group"
                          >
                            <button
                              type="button"
                              onClick={(e) => handleDeleteProductFromRecommendations(e, rec.id, rec.name)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/90 hover:bg-rose-600 hover:text-white text-muted-foreground flex items-center justify-center shadow-xs transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                              title="Remove from recommendations"
                            >
                              <Trash2 size={12} />
                            </button>
                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-secondary/30 mb-2 relative">
                              <img src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
                              {rec.discountPct > 0 && (
                                <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                  {rec.discountPct}% OFF
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-foreground line-clamp-1">{rec.name}</p>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-xs font-bold text-foreground">{formatPrice(rec.price)}</span>
                              <span className="text-[9px] text-muted-foreground line-through">{formatPrice(rec.originalPrice)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Global Cart Upsells Tab */}
          {activeTab === "global-cart" && (
            <div className="space-y-6">
              <div className="glass-card rounded-3xl border border-border p-5 space-y-5 bg-card/75 shadow-xs">
                <h2 className="font-serif text-lg font-medium border-b border-border/50 pb-2">
                  Global Cart Recommendation Strategy
                </h2>

                {/* Random vs Curated Mode */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/60">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                        {config.isRandom ? <Shuffle size={16} className="text-accent" /> : <ListOrdered size={16} className="text-accent" />}
                        {config.isRandom ? "Dynamic Random Upsell Mode" : "Strict Curated Order Mode"}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${config.isRandom ? "bg-emerald-500/15 text-emerald-600" : "bg-accent/15 text-accent"}`}>
                        {config.isRandom ? "RANDOM" : "CURATED"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When no product-specific rule applies, the cart drawer will either randomize recommendations on each visit or display in strict priority order.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, isRandom: !prev.isRandom }))}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      config.isRandom ? "bg-accent" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        config.isRandom ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Section Title & Max Count Slider */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1.5">
                      Drawer Section Title
                    </label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-xs outline-none border border-border focus:border-accent"
                      placeholder="e.g. Recommended For You"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                        Max Items To Display in Cart
                      </label>
                      <span className="text-xs font-mono font-bold text-foreground">{config.maxDisplayCount} items</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={8}
                      step={1}
                      value={config.maxDisplayCount}
                      onChange={(e) => setConfig((prev) => ({ ...prev, maxDisplayCount: Number(e.target.value) }))}
                      className="w-full accent-accent cursor-pointer mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
