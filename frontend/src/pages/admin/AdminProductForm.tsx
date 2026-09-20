import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { saveRecord } from "@/lib/audit";
import { PreviewButton } from "@/components/admin/PreviewButton";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  X, 
  Plus, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  Check, 
  ArrowUpDown, 
  Layers, 
  RotateCcw,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { TextStyleEditor } from "@/components/admin/TextStyleEditor";
import { RECORD_FIELDS, type StyleMap } from "@/lib/textStyles";
import { 
  ProductSizeInfo, 
  FREE_SIZE_PRESETS, 
  SIZE_UNITS, 
  getProductSizeLabel 
} from "@/lib/productSize";

export const OCCASIONS = [
  {
    id: "daily",
    title: "Daily Wear",
    icon: "✨",
    badge: "Everyday Classic",
    desc: "Everyday subtle & versatile elegance (Default)",
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    activeRing: "ring-2 ring-emerald-500 bg-emerald-500/10 border-emerald-500",
  },
  {
    id: "office",
    title: "Office Wear",
    icon: "💼",
    badge: "Professional Minimal",
    desc: "Clean, minimal & smart contemporary office styling",
    color: "from-blue-500/20 to-blue-500/5 text-blue-700 dark:text-blue-300 border-blue-500/40",
    activeRing: "ring-2 ring-blue-500 bg-blue-500/10 border-blue-500",
  },
  {
    id: "party",
    title: "Party & Festive",
    icon: "🎉",
    badge: "Celebration & Evening",
    desc: "Glamorous, sparkling & vibrant festive statements",
    color: "from-purple-500/20 to-purple-500/5 text-purple-700 dark:text-purple-300 border-purple-500/40",
    activeRing: "ring-2 ring-purple-500 bg-purple-500/10 border-purple-500",
  },
  {
    id: "wedding",
    title: "Bridal & Wedding",
    icon: "👰",
    badge: "Heirloom & Grand",
    desc: "Opulent, grand & royal wedding and bridal jewellery",
    color: "from-amber-500/20 to-amber-500/5 text-amber-700 dark:text-amber-300 border-amber-500/40",
    activeRing: "ring-2 ring-amber-500 bg-amber-500/10 border-amber-500",
  },
];

type Props = { id?: string; onDone: () => void };

type GalleryImage = {
  url: string;
  sort_order: number;
  id?: string;
};

export default function ProductForm({ id, onDone }: Props) {
  const editing = !!id;
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "0",
    compare_at_price: "",
    category_id: "",
    stock: "0",
    is_active: true,
    is_featured: false,
    sort_order: "0",
    show_stock: true,
    stock_prefix: "",
    stock_suffix: "",
    out_of_stock: false,
    video_url: "",
    text_style: {} as StyleMap,
  });

  // Mandatory Product Occasion (Style & Wear) state
  const [occasion, setOccasion] = useState<string>("daily");

  // Mandatory Product Size state
  const [sizeMode, setSizeMode] = useState<"free" | "custom">("free");
  const [freeType, setFreeType] = useState<string>("Free Size (Adjustable)");
  const [customSizeValue, setCustomSizeValue] = useState<string>("");
  const [customSizeUnit, setCustomSizeUnit] = useState<string>("inch");
  const [customUnitOther, setCustomUnitOther] = useState<string>("");

  // Product Rating & Review Count state
  const [showRating, setShowRating] = useState<boolean>(true);
  const [ratingValue, setRatingValue] = useState<string>("4.8");
  const [reviewCount, setReviewCount] = useState<string>("5");

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [newImg, setNewImg] = useState("");
  const [enableHoverTransition, setEnableHoverTransition] = useState(false);
  const [hoverImgUrl, setHoverImgUrl] = useState("");
  const [isGalleryArrangeOpen, setIsGalleryArrangeOpen] = useState(false);
  const [selectedGalleryUrls, setSelectedGalleryUrls] = useState<string[]>([]);

  const { data: cats } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("products").select("*, product_images(*)").eq("id", id).maybeSingle();
      if (data) {
        const textStyle = ((data as any).text_style ?? {}) as any;

        setForm({
          name: data.name,
          slug: data.slug,
          description: data.description ?? "",
          price: String(data.price),
          compare_at_price: data.compare_at_price != null ? String(data.compare_at_price) : "",
          category_id: data.category_id ?? "",
          stock: String(data.stock),
          is_active: data.is_active,
          is_featured: data.is_featured,
          sort_order: String(data.sort_order),
          show_stock: data.show_stock,
          stock_prefix: data.stock_prefix ?? "",
          stock_suffix: data.stock_suffix ?? "",
          out_of_stock: (data as any).out_of_stock ?? false,
          video_url: (data as any).video_url ?? "",
          text_style: textStyle,
        });

        // Load Product Occasion (Style & Wear)
        setOccasion(textStyle.occasion || "daily");

        // Load Product Size metadata
        if (textStyle.size_info) {
          const si = textStyle.size_info;
          if (typeof si === "object") {
            setSizeMode(si.mode === "custom" ? "custom" : "free");
            setFreeType(si.free_type || si.label || "Free Size (Adjustable)");
            setCustomSizeValue(si.value || "");
            setCustomSizeUnit(si.unit || "inch");
            setCustomUnitOther(si.custom_unit || "");
          } else if (typeof si === "string" && si.trim()) {
            if (si.toLowerCase().includes("free") || si.toLowerCase().includes("adjust")) {
              setSizeMode("free");
              setFreeType(si);
            } else {
              setSizeMode("custom");
              setCustomSizeValue(si);
            }
          }
        }

        // Load Rating & Review count metadata
        if (textStyle.rating_info) {
          const ri = textStyle.rating_info;
          setShowRating(ri.show_rating !== false);
          setRatingValue(ri.rating_value != null ? String(ri.rating_value) : "4.8");
          setReviewCount(ri.review_count != null ? String(ri.review_count) : "5");
        }

        const sortedImgs = ((data.product_images ?? []) as any[]).sort((a, b) => a.sort_order - b.sort_order);
        setImages(sortedImgs);

        // Load explicit hover transition state from product config
        if (textStyle.enable_hover_image != null) {
          setEnableHoverTransition(!!textStyle.enable_hover_image);
          setHoverImgUrl(textStyle.hover_image_url || "");
        } else if (textStyle.hover_image_url) {
          setEnableHoverTransition(true);
          setHoverImgUrl(textStyle.hover_image_url);
        }
      }
    })();
  }, [id]);

  const input = "w-full bg-secondary/60 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent border border-border/40";
  const label = "text-xs uppercase tracking-widest text-muted-foreground font-medium";

  // Reorder Gallery Images (strictly reorders gallery, NEVER touches hover view photo)
  function moveImage(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImages(updated);
  }

  function handleDirectSequenceChange(fromIndex: number, newSeqNum: number) {
    if (isNaN(newSeqNum) || newSeqNum < 1 || newSeqNum > images.length) return;
    moveImage(fromIndex, newSeqNum - 1);
  }

  function moveToExtreme(fromIndex: number, position: "top" | "bottom") {
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    if (position === "top") {
      updated.unshift(moved);
    } else {
      updated.push(moved);
    }
    setImages(updated);
  }

  function setAsPrimary(index: number) {
    if (index === 0) return;
    moveImage(index, 0);
    toast.success("Set as primary thumbnail (#1)");
  }

  function handleGalleryItemClick(urlOrId: string) {
    if (selectedGalleryUrls.includes(urlOrId)) {
      setSelectedGalleryUrls(selectedGalleryUrls.filter((x) => x !== urlOrId));
    } else {
      setSelectedGalleryUrls([...selectedGalleryUrls, urlOrId]);
    }
  }

  function applySelectedGallerySequence() {
    if (selectedGalleryUrls.length === 0) return;
    const selectedItems = selectedGalleryUrls
      .map((u) => images.find((im) => (im.id || im.url) === u)!)
      .filter(Boolean);
    const remainingItems = images.filter((im) => !selectedGalleryUrls.includes(im.id || im.url));
    setImages([...selectedItems, ...remainingItems]);
    setSelectedGalleryUrls([]);
    toast.success("Applied custom click sequence to gallery");
  }

  function applyGalleryPreset(type: "reverse" | "reset") {
    if (type === "reverse") {
      setImages([...images].reverse());
      toast.success("Reversed gallery sequence");
    }
  }

  async function save() {
    if (!form.name || !form.slug) {
      toast.error("Name & slug required");
      return;
    }

    // Validate Mandatory Sizing
    let finalSizeLabel = "";
    if (sizeMode === "free") {
      finalSizeLabel = freeType.trim() || "Free Size (Adjustable)";
    } else {
      if (!customSizeValue.trim()) {
        toast.error("Product size is mandatory! Please enter the size value or choose Free Size.");
        return;
      }
      const unitStr = customSizeUnit === "custom" ? customUnitOther.trim() : customSizeUnit;
      if (customSizeUnit === "custom" && !customUnitOther.trim()) {
        toast.error("Please enter the custom unit/degree of measurement.");
        return;
      }
      finalSizeLabel = unitStr ? `${customSizeValue.trim()} ${unitStr}` : customSizeValue.trim();
    }

    const sizeInfoPayload: ProductSizeInfo = {
      mode: sizeMode,
      free_type: sizeMode === "free" ? freeType.trim() : undefined,
      value: sizeMode === "custom" ? customSizeValue.trim() : undefined,
      unit: sizeMode === "custom" ? customSizeUnit : undefined,
      custom_unit: sizeMode === "custom" && customSizeUnit === "custom" ? customUnitOther.trim() : undefined,
      label: finalSizeLabel,
    };

    const ratingInfoPayload = {
      show_rating: showRating,
      rating_value: parseFloat(ratingValue) || 4.8,
      review_count: parseInt(reviewCount, 10) || 5,
    };

    const updatedTextStyle: any = {
      ...(form.text_style || {}),
      occasion: occasion || "daily",
      enable_hover_image: enableHoverTransition,
      hover_image_url: enableHoverTransition && hoverImgUrl ? hoverImgUrl : null,
      size_info: sizeInfoPayload,
      rating_info: ratingInfoPayload,
    };

    const payload: any = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      category_id: form.category_id || null,
      stock: Number(form.stock),
      is_active: form.is_active,
      is_featured: form.is_featured,
      sort_order: Number(form.sort_order),
      show_stock: form.show_stock,
      stock_prefix: form.stock_prefix || null,
      stock_suffix: form.stock_suffix || null,
      out_of_stock: form.out_of_stock,
      video_url: form.video_url || null,
      text_style: updatedTextStyle,
    };

    const { error, id: savedId } = await saveRecord({
      table: "products",
      id: id ?? null,
      payload,
      label: form.name,
    });

    if (error) {
      toast.error(error.message ?? "Could not save product");
      return;
    }

    const productId = savedId ?? id;

    // Sync gallery images to database in their exact ordered sequence
    await supabase.from("product_images").delete().eq("product_id", productId!);
    if (images.length) {
      await supabase
        .from("product_images")
        .insert(images.map((im, i) => ({ product_id: productId!, url: im.url, sort_order: i })));
    }

    toast.success("Product saved successfully");
    onDone();
  }

  return (
    <div className="max-w-4xl pb-20">
      <button onClick={onDone} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground mb-4">
        ← Back to products
      </button>
      <h1 className="font-serif text-3xl mb-6">{editing ? "Edit Product" : "New Product"}</h1>

      {/* Main Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Name</label>
          <input
            className={input}
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: !editing
                  ? e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                  : form.slug,
              })
            }
          />
        </div>
        <div>
          <label className={label}>Slug (URL Key)</label>
          <input className={input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        {/* Dynamic 2-Way Pricing & Discount Calculator Card */}
        <div className="md:col-span-2 glass-card rounded-2xl p-4 border border-border/60 bg-secondary/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-foreground">
                Pricing & Automatic Discount Calculator
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Enter Compare-at (MRP) and either Selling Price or Discount % to auto-calculate values.
              </p>
            </div>
            {Number(form.compare_at_price) > Number(form.price) && Number(form.price) > 0 && (
              <span className="bg-accent/15 border border-accent/30 text-accent font-semibold px-3 py-1 rounded-full text-xs animate-in fade-in">
                🔥 {Math.round(((Number(form.compare_at_price) - Number(form.price)) / Number(form.compare_at_price)) * 100)}% OFF (Save ₹{Number(form.compare_at_price) - Number(form.price)})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={label}>Compare-at ₹ (Original MRP)</label>
              <input
                type="number"
                className={input}
                placeholder="e.g. 1000"
                value={form.compare_at_price ?? ""}
                onChange={(e) => {
                  const compareAt = e.target.value;
                  setForm((prev) => ({ ...prev, compare_at_price: compareAt }));
                }}
              />
            </div>
            <div>
              <label className={label}>Price ₹ (Final Selling Price)</label>
              <input
                type="number"
                className={input}
                placeholder="e.g. 699"
                value={form.price ?? ""}
                onChange={(e) => {
                  const price = e.target.value;
                  setForm((prev) => ({ ...prev, price }));
                }}
              />
            </div>
            <div>
              <label className={label}>Discount % (Auto Calc)</label>
              <input
                type="number"
                className={input}
                placeholder="e.g. 30"
                value={
                  Number(form.compare_at_price) > 0 &&
                  Number(form.price) > 0 &&
                  Number(form.compare_at_price) > Number(form.price)
                    ? Math.round(((Number(form.compare_at_price) - Number(form.price)) / Number(form.compare_at_price)) * 100)
                    : ""
                }
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val === "") {
                    return;
                  }
                  const pct = Number(val);
                  const compareAt = Number(form.compare_at_price);
                  if (compareAt > 0 && !isNaN(pct) && pct >= 0 && pct <= 100) {
                    const newPrice = Math.max(0, Math.round(compareAt * (1 - pct / 100)));
                    setForm((prev) => ({ ...prev, price: String(newPrice) }));
                  }
                }}
              />
            </div>
            <div>
              <label className={label}>Discount Amount ₹ (Off)</label>
              <input
                type="number"
                className={input}
                placeholder="e.g. 301"
                value={
                  Number(form.compare_at_price) > 0 &&
                  Number(form.price) > 0 &&
                  Number(form.compare_at_price) > Number(form.price)
                    ? Number(form.compare_at_price) - Number(form.price)
                    : ""
                }
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (val === "") {
                    return;
                  }
                  const flatAmt = Number(val);
                  const compareAt = Number(form.compare_at_price);
                  if (compareAt > 0 && !isNaN(flatAmt) && flatAmt >= 0) {
                    const newPrice = Math.max(0, compareAt - flatAmt);
                    setForm((prev) => ({ ...prev, price: String(newPrice) }));
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <label className={label}>Category</label>
          <select
            className={input}
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">— None —</option>
            {cats?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Stock Quantity</label>
          <input
            type="number"
            className={input}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Sort Order (0 = Top First)</label>
          <input
            type="number"
            className={input}
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 accent-accent rounded"
            />{" "}
            Active
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4 accent-accent rounded"
            />{" "}
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.out_of_stock}
              onChange={(e) => setForm({ ...form, out_of_stock: e.target.checked })}
              className="w-4 h-4 accent-accent rounded"
            />{" "}
            Out of stock
          </label>
        </div>

        <div className="md:col-span-2 glass-card rounded-2xl p-4 grid md:grid-cols-3 gap-3 border border-border/60">
          <label className="flex items-center gap-2 text-sm md:col-span-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.show_stock}
              onChange={(e) => setForm({ ...form, show_stock: e.target.checked })}
              className="w-4 h-4 accent-accent rounded"
            />{" "}
            Show stock badge on product card
          </label>
          <div>
            <label className={label}>Badge prefix</label>
            <input
              className={input}
              placeholder="e.g. Hurry!"
              value={form.stock_prefix ?? ""}
              onChange={(e) => setForm({ ...form, stock_prefix: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Badge suffix</label>
            <input
              className={input}
              placeholder="e.g. Only 2 Left"
              value={form.stock_suffix ?? ""}
              onChange={(e) => setForm({ ...form, stock_suffix: e.target.value })}
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className={label}>Badge Live Preview</label>
            <div className="mt-1 flex items-center gap-2">
              {(() => {
                const prefix = form.stock_prefix?.trim() || null;
                const suffix = form.stock_suffix?.trim() || null;
                let text = "";
                if (form.show_stock) {
                  text = [prefix, form.stock, suffix || "left"].filter(Boolean).join(" ");
                } else if (prefix || suffix) {
                  text = [prefix, suffix].filter(Boolean).join(" ");
                }
                if (!text) {
                  return <span className="text-xs text-muted-foreground italic">(Badge hidden on card)</span>;
                }
                return (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center text-[10px] tracking-wide px-2.5 py-1 rounded-full bg-terracotta/90 text-alabaster font-medium shadow-xs">
                      {text}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (Preview: {text})
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* MANDATORY PRODUCT SIZING & DIMENSIONS SECTION */}
      <div className="mt-6 glass-card rounded-2xl p-5 border border-border/80 bg-secondary/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase tracking-widest font-bold text-foreground flex items-center gap-1.5">
                <span>📏 Product Sizing & Dimensions</span>
                <span className="text-[10px] bg-red-500/15 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full border border-red-500/20">
                  Mandatory
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Choose Free Size (for adjustable necklaces, open rings, earrings) or enter exact dimensions & unit of measurement.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-muted-foreground font-medium">Live Storefront Badge:</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 shadow-xs">
              📏 {sizeMode === "free"
                ? (freeType.trim() || "Free Size (Adjustable)")
                : (customSizeValue.trim()
                    ? `${customSizeValue.trim()} ${customSizeUnit === "custom" ? (customUnitOther.trim() || "units") : customSizeUnit}`
                    : "(Enter size value)")}
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/60 rounded-xl border border-border/40">
          <button
            type="button"
            onClick={() => setSizeMode("free")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              sizeMode === "free"
                ? "bg-foreground text-background shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ✨ Free Size / Adjustable
          </button>
          <button
            type="button"
            onClick={() => setSizeMode("custom")}
            className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              sizeMode === "custom"
                ? "bg-foreground text-background shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📐 Specific Size & Dimensions
          </button>
        </div>

        {sizeMode === "free" ? (
          <div className="space-y-3 pt-1">
            <label className={label}>Select Free Size Preset or Enter Custom</label>
            <div className="flex flex-wrap gap-2">
              {FREE_SIZE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFreeType(preset)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    freeType === preset
                      ? "border-accent bg-accent/15 text-accent font-semibold ring-1 ring-accent/30"
                      : "border-border/60 bg-secondary/40 text-foreground/80 hover:border-accent/40"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div>
              <label className={label}>Or Custom Free Size Description</label>
              <input
                className={input}
                placeholder="e.g. Free Size (Adjustable with 2 inch extender)"
                value={freeType}
                onChange={(e) => setFreeType(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div>
              <label className={label}>Size Value / Dimensions *</label>
              <input
                className={input}
                placeholder="e.g. 18 or 2.4 or 7 or 16-18"
                value={customSizeValue}
                onChange={(e) => setCustomSizeValue(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Degree of Measurement / Unit *</label>
              <select
                className={input}
                value={customSizeUnit}
                onChange={(e) => setCustomSizeUnit(e.target.value)}
              >
                {SIZE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            {customSizeUnit === "custom" && (
              <div className="sm:col-span-2 lg:col-span-1">
                <label className={label}>Custom Unit Name *</label>
                <input
                  className={input}
                  placeholder="e.g. Gauge, Extender, Meter"
                  value={customUnitOther}
                  onChange={(e) => setCustomUnitOther(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* MANDATORY OCCASION (STYLE & WEAR) SECTION */}
      <div className="mt-6 glass-card rounded-2xl p-5 border border-border/80 bg-secondary/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase tracking-widest font-bold text-foreground flex items-center gap-1.5">
                <span>👗 Occasion (Style & Wear)</span>
                <span className="text-[10px] bg-red-500/15 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full border border-red-500/20">
                  Mandatory
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Select the primary wear occasion. Used for customer storefront filtering & curated style collections (defaults to Daily Wear).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-muted-foreground font-medium">Selected Occasion:</span>
            {(() => {
              const currentOcc = OCCASIONS.find((o) => o.id === occasion) || OCCASIONS[0];
              return (
                <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold shadow-xs border bg-linear-to-r ${currentOcc.color}`}>
                  <span>{currentOcc.icon}</span>
                  <span>{currentOcc.title}</span>
                </span>
              );
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {OCCASIONS.map((occ) => {
            const isSelected = occasion === occ.id;
            return (
              <button
                key={occ.id}
                type="button"
                onClick={() => setOccasion(occ.id)}
                className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? `${occ.activeRing} shadow-md`
                    : "border-border/60 bg-background/50 hover:bg-background/80 hover:border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{occ.icon}</span>
                    <div>
                      <h4 className="font-semibold text-xs text-foreground leading-tight">{occ.title}</h4>
                      <span className="text-[9px] text-muted-foreground font-medium">{occ.badge}</span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-accent border-accent text-accent-foreground"
                        : "border-muted-foreground/40 bg-transparent"
                    }`}
                  >
                    {isSelected && <Check size={10} strokeWidth={3} />}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {occ.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCT RATING & REVIEW COUNT (STOREFRONT & PREVIEW) */}
      <div className="mt-6 glass-card rounded-2xl p-5 border border-border/80 bg-secondary/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-foreground flex items-center gap-1.5">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>Product Star Rating & Review Count</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Set the exact star score (e.g. 4.8) and number of reviews displayed under product title and in live preview.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-muted-foreground font-medium">Live Preview:</span>
            {showRating ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-400/15 text-foreground border border-amber-400/30 shadow-xs">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={11}
                      className={s <= Math.round(Number(ratingValue) || 4.8) ? "fill-amber-400 text-amber-400" : "text-border"}
                    />
                  ))}
                </div>
                <span className="font-bold text-foreground">{Number(ratingValue) ? Number(ratingValue).toFixed(1) : "4.8"}</span>
                <span className="text-muted-foreground">({reviewCount || "5"} reviews)</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">(Rating hidden on page)</span>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 items-center">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRating}
              onChange={(e) => setShowRating(e.target.checked)}
              className="w-4 h-4 accent-accent rounded"
            />
            <span>Show Rating Stars on Product Page</span>
          </label>

          <div>
            <label className={label}>Rating Score (1.0 to 5.0)</label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              className={input}
              placeholder="e.g. 4.8"
              value={ratingValue}
              onChange={(e) => setRatingValue(e.target.value)}
              disabled={!showRating}
            />
          </div>

          <div>
            <label className={label}>Review Count (Number of reviews)</label>
            <input
              type="number"
              min="0"
              className={input}
              placeholder="e.g. 5"
              value={reviewCount}
              onChange={(e) => setReviewCount(e.target.value)}
              disabled={!showRating}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className={label}>Description</label>
        <textarea
          rows={3}
          className={input}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {/* MEDIA SECTION WITH DEDICATED HOVER TRANSITION TOGGLE */}
      <div className="mt-8 glass-card rounded-3xl p-6 border border-border/60 space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h2 className="font-serif text-xl font-medium">Product Gallery & Media</h2>
            <p className="text-xs text-muted-foreground">
              Add multiple photos for this product. Reordering gallery images will not affect your hover settings.
            </p>
          </div>
        </div>

        {/* 1. Add Image(s) to Gallery */}
        <div>
          <label className={label}>Add Photo(s) to Gallery</label>
          <div className="mt-2">
            <MediaUpload
              value={newImg}
              onChange={(url) => {
                if (url) {
                  setImages((prev) => [...prev, { url, sort_order: prev.length }]);
                  setNewImg("");
                  toast.success("Image added to gallery sequence");
                }
              }}
              multiple={true}
              onMultipleUpload={(urls) => {
                setImages((prev) => [
                  ...prev,
                  ...urls.map((url, idx) => ({ url, sort_order: prev.length + idx })),
                ]);
                setNewImg("");
                toast.success(`Added ${urls.length} images to product gallery in sequence`);
              }}
              accept="image"
              folder="products"
              defaultName={form.slug ? `${form.slug}-${images.length + 1}` : ""}
              hint="Select multiple images at once to upload and sequence together"
            />
            {newImg && (
              <button
                type="button"
                onClick={() => {
                  if (newImg.trim()) {
                    setImages([...images, { url: newImg.trim(), sort_order: images.length }]);
                    setNewImg("");
                    toast.success("Image added to gallery sequence");
                  }
                }}
                className="mt-2 flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium"
              >
                <Plus size={14} /> Add to gallery
              </button>
            )}
          </div>
        </div>

        {/* 2. Structured Gallery Image Preview Boxes */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <label className={label}>
                Gallery Sequence ({images.length} {images.length === 1 ? "photo" : "photos"})
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                #1 is Primary Storefront Thumbnail. Change numbers, arrows, or arrange sequence.
              </p>
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyGalleryPreset("reverse")}
                  className="px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-foreground text-xs flex items-center gap-1 transition-all border border-border/40"
                  title="Reverse image sequence"
                >
                  <RotateCcw size={12} /> Reverse
                </button>
                <button
                  type="button"
                  onClick={() => setIsGalleryArrangeOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-accent/15 hover:bg-accent/25 text-accent text-xs font-semibold flex items-center gap-1.5 transition-all border border-accent/30 shadow-xs"
                >
                  <ArrowUpDown size={13} /> Arrange Sequence
                </button>
              </div>
            )}
          </div>

          {images.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-dashed border-border">
              No images uploaded yet. Drop multiple images above or paste a URL to build product gallery.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((im, i) => {
                const isPrimary = i === 0;

                return (
                  <div
                    key={im.id || im.url + i}
                    className={`relative rounded-2xl overflow-hidden border bg-card/60 p-2.5 flex flex-col justify-between shadow-sm transition-all ${
                      isPrimary
                        ? "border-accent ring-2 ring-accent/30 bg-accent/5"
                        : "border-border/60 hover:border-border"
                    }`}
                  >
                    {/* Image Preview Box */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary/40 flex items-center justify-center border border-border/30">
                      <img src={im.url} alt="" className="w-full h-full object-contain p-1" />
                      <span className="absolute top-2 left-2 bg-background/90 backdrop-blur text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shadow-xs flex items-center gap-1 text-foreground">
                        #{i + 1}
                      </span>

                      {isPrimary && (
                        <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider shadow">
                          Thumbnail
                        </span>
                      )}
                    </div>

                    {/* Sequence Position Jump Input */}
                    <div className="flex items-center justify-between gap-1 mt-2 px-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium">Position:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={images.length}
                          value={i + 1}
                          onChange={(e) => handleDirectSequenceChange(i, parseInt(e.target.value))}
                          className="w-10 bg-secondary text-center rounded-md py-0.5 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-accent border border-border/40"
                          title="Type sequence position to move"
                        />
                        <span className="text-[10px] text-muted-foreground font-mono">/ {images.length}</span>
                      </div>
                    </div>

                    {/* Action Bar for each image */}
                    <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(i, i - 1)}
                          disabled={i === 0}
                          className="p-1 rounded bg-secondary/80 hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors"
                          title="Move Left"
                        >
                          <ArrowLeft size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(i, i + 1)}
                          disabled={i === images.length - 1}
                          className="p-1 rounded bg-secondary/80 hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors"
                          title="Move Right"
                        >
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => setAsPrimary(i)}
                            className="p-1.5 rounded-lg text-[10px] bg-secondary hover:bg-accent/15 hover:text-accent text-muted-foreground transition-colors"
                            title="Set as Primary Thumbnail (#1)"
                          >
                            <Star size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, x) => x !== i))}
                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete image"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Interactive Gallery Arrangement Modal */}
        {isGalleryArrangeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-3xl max-h-[85vh] rounded-3xl border border-border/80 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-secondary/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                    <ArrowUpDown size={16} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-semibold">Arrange Gallery Sequence</h2>
                    <p className="text-[11px] text-muted-foreground">
                      Click numbered sequence badges, change pos numbers, or move items to arrange display order.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGalleryArrangeOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Click-to-Rank Sequence Toolbar */}
              <div className="px-6 py-3 bg-secondary/15 border-b border-border/40 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyGalleryPreset("reverse")}
                    className="px-3 py-1 rounded-full bg-card hover:bg-secondary border border-border/60 text-foreground text-xs flex items-center gap-1 transition-all"
                  >
                    <RotateCcw size={11} /> Reverse Sequence
                  </button>
                </div>

                {selectedGalleryUrls.length > 0 && (
                  <div className="flex items-center gap-2 bg-accent/15 text-accent px-3 py-1 rounded-full text-xs font-medium">
                    <span>{selectedGalleryUrls.length} photos ranked in click order</span>
                    <button
                      type="button"
                      onClick={applySelectedGallerySequence}
                      className="bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Place at Top
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGalleryUrls([])}
                      className="text-muted-foreground hover:text-foreground text-[10px] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
                {images.map((im, i) => {
                  const clickRank = selectedGalleryUrls.indexOf(im.id || im.url);
                  const isClickSelected = clickRank !== -1;
                  const isPrimary = i === 0;

                  return (
                    <div
                      key={im.id || im.url + i}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border bg-card/60 transition-all ${
                        isClickSelected
                          ? "border-accent ring-2 ring-accent/30 bg-accent/5"
                          : isPrimary
                          ? "border-accent/40 bg-accent/5"
                          : "border-border/60 hover:border-border hover:bg-secondary/30"
                      }`}
                    >
                      {/* Left: Sequence Rank Badge + Thumbnail */}
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleGalleryItemClick(im.id || im.url)}
                          className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isClickSelected
                              ? "bg-accent text-accent-foreground scale-110 shadow"
                              : "bg-secondary text-foreground hover:bg-accent/20 hover:text-accent"
                          }`}
                          title="Click to assign custom ranking order"
                        >
                          {isClickSelected ? `#${clickRank + 1}` : `#${i + 1}`}
                        </button>

                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/40 flex-shrink-0 border border-border/40 flex items-center justify-center">
                          <img src={im.url} alt="" className="w-full h-full object-contain p-0.5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground truncate">
                              Image #{i + 1}
                            </span>
                            {isPrimary && (
                              <span className="bg-accent text-accent-foreground text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                                Primary Thumbnail
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono truncate max-w-xs mt-0.5">
                            {im.url}
                          </p>
                        </div>
                      </div>

                      {/* Right: Direct Pos Input & Stepper Controls */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1 mr-2">
                          <span className="text-[10px] text-muted-foreground">Pos:</span>
                          <input
                            type="number"
                            min={1}
                            max={images.length}
                            value={i + 1}
                            onChange={(e) => handleDirectSequenceChange(i, parseInt(e.target.value))}
                            className="w-11 bg-secondary text-center rounded-lg py-1 text-xs font-mono font-semibold outline-none focus:ring-1 focus:ring-accent border border-border/40"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => moveImage(i, i - 1)}
                          disabled={i === 0}
                          className="p-1.5 rounded-lg bg-secondary/70 hover:bg-secondary disabled:opacity-30 text-muted-foreground transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(i, i + 1)}
                          disabled={i === images.length - 1}
                          className="p-1.5 rounded-lg bg-secondary/70 hover:bg-secondary disabled:opacity-30 text-muted-foreground transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveToExtreme(i, "top")}
                          disabled={i === 0}
                          className="px-2 py-1 rounded-lg bg-secondary/70 hover:bg-secondary disabled:opacity-30 text-[10px] text-muted-foreground font-semibold transition-colors cursor-pointer"
                          title="Move to Top (#1)"
                        >
                          Top
                        </button>
                        <button
                          type="button"
                          onClick={() => moveToExtreme(i, "bottom")}
                          disabled={i === images.length - 1}
                          className="px-2 py-1 rounded-lg bg-secondary/70 hover:bg-secondary disabled:opacity-30 text-[10px] text-muted-foreground font-semibold transition-colors cursor-pointer"
                          title="Move to End"
                        >
                          End
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between bg-secondary/30">
                <span className="text-xs text-muted-foreground font-mono">
                  {images.length} gallery images in display sequence
                </span>
                <button
                  type="button"
                  onClick={() => setIsGalleryArrangeOpen(false)}
                  className="bg-accent text-accent-foreground px-6 py-2 rounded-full text-xs uppercase tracking-widest font-semibold shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. DEDICATED HOVER TRANSITION SETTING (Independent from Gallery Order) */}
        <div className="p-5 rounded-2xl border border-border/60 bg-secondary/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs uppercase tracking-widest font-semibold text-foreground flex items-center gap-2">
                <Sparkles size={14} className="text-accent" />
                <span>Secondary Image on Hover Transition</span>
              </label>
              <p className="text-[11px] text-muted-foreground">
                By default OFF. When enabled, hovering over the card on the storefront crossfades to this photo, and it appears at the end of the customer image gallery swipe.
              </p>
            </div>

            <input
              type="checkbox"
              checked={enableHoverTransition}
              onChange={(e) => setEnableHoverTransition(e.target.checked)}
              className="w-5 h-5 accent-accent rounded cursor-pointer"
            />
          </div>

          {/* Expanded Hover Transition Settings (Only visible when toggle is ON) */}
          {enableHoverTransition && (
            <div className="pt-4 border-t border-border/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className={label}>Secondary Hover Photo</label>
                <span className="text-[10px] text-blue-600 font-medium">Independent Hover Photo</span>
              </div>

              <MediaUpload
                value={hoverImgUrl}
                onChange={(url) => setHoverImgUrl(url)}
                accept="image"
                folder="products"
                hint="Upload or paste the photo to display when customer hovers"
              />

              {/* Quick Select from existing gallery if admin wants to reuse an image */}
              {images.length > 0 && (
                <div className="mt-3 pt-2">
                  <p className="text-[11px] text-muted-foreground mb-2">Or select from uploaded gallery images:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((im, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setHoverImgUrl(im.url);
                          toast.success(`Selected image #${i + 1} as Hover Photo`);
                        }}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all flex items-center justify-center bg-secondary/30 ${
                          hoverImgUrl === im.url ? "border-blue-600 ring-2 ring-blue-600/30" : "border-border opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={im.url} alt="" className="w-full h-full object-contain p-0.5" />
                        {hoverImgUrl === im.url && (
                          <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Product Video (Optional) */}
        <div>
          <MediaUpload
            label="Product Video Reel (Optional)"
            value={form.video_url}
            onChange={(v) => setForm({ ...form, video_url: v })}
            accept="video"
            folder="products"
            hint="Short video loop for product page"
          />
        </div>
      </div>

      {/* Text Style Customizer */}
      <div className="mt-6" data-tour="record-style">
        <TextStyleEditor
          title="Text styling for this product"
          hint="Style this product's name, price, description and stock badge."
          fields={RECORD_FIELDS.products}
          value={(form.text_style ?? {}) as StyleMap}
          onChange={(v) => setForm({ ...form, text_style: v })}
        />
      </div>

      {/* Save Actions */}
      <div className="flex flex-wrap gap-3 mt-8 items-center pt-4 border-t border-border/60">
        <button
          type="button"
          onClick={save}
          className="bg-accent text-accent-foreground px-7 py-3 rounded-full text-xs uppercase tracking-widest font-semibold shadow-md hover:opacity-95 active:scale-95 transition-all"
        >
          Save Product
        </button>
        <PreviewButton
          target="products"
          path={form.slug ? `/product/${form.slug}` : undefined}
          draft={{
            table: "products",
            id: id ?? null,
            values: {
              ...form,
              price: Number(form.price) || 0,
              compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
              stock: Number(form.stock) || 0,
              product_images: images.map((im, i) => ({ url: im.url, sort_order: i })),
              text_style: {
                ...(form.text_style || {}),
                enable_hover_image: enableHoverTransition,
                hover_image_url: enableHoverTransition && hoverImgUrl ? hoverImgUrl : null,
                size_info: {
                  mode: sizeMode,
                  free_type: sizeMode === "free" ? freeType.trim() : undefined,
                  value: sizeMode === "custom" ? customSizeValue.trim() : undefined,
                  unit: sizeMode === "custom" ? customSizeUnit : undefined,
                  custom_unit: sizeMode === "custom" && customSizeUnit === "custom" ? customUnitOther.trim() : undefined,
                  label: sizeMode === "free"
                    ? (freeType.trim() || "Free Size (Adjustable)")
                    : (customSizeUnit === "custom" && customUnitOther.trim()
                        ? `${customSizeValue.trim()} ${customUnitOther.trim()}`
                        : `${customSizeValue.trim()} ${customSizeUnit}`),
                },
                rating_info: {
                  show_rating: showRating,
                  rating_value: parseFloat(ratingValue) || 4.8,
                  review_count: parseInt(reviewCount, 10) || 5,
                },
              },
            },
          }}
          label="Preview Changes"
        />
        <button
          type="button"
          onClick={onDone}
          className="border border-border px-6 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-secondary/60 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
