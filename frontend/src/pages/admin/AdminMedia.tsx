import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia, isVideoUrl, deleteMediaFromStorage } from "@/lib/media";
import { toast } from "sonner";
import { 
  Copy, 
  Loader2, 
  Trash2, 
  UploadCloud, 
  RefreshCw, 
  ExternalLink, 
  Image as ImageIcon, 
  Video, 
  Folder, 
  Link as LinkIcon, 
  Eye, 
  X,
  Layers,
  Sparkles,
  Search,
  Check,
  CheckSquare,
  Square,
  ArrowUpDown,
  ListOrdered
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const BUCKETS = ["media", "product-media", "banners", "videos", "public-assets"];
const FOLDERS = ["uploads", "products", "categories", "banners", "reviews", "videos", "pages", ""];

export type MediaItem = {
  bucket: string;
  folder: string;
  path: string;
  name: string;
  displayName: string;
  url: string;
  size: number;
  createdAt: string;
  linkedEntity?: {
    type: "product" | "category" | "banner" | "video";
    id: string;
    name: string;
    extra?: string;
  } | null;
};

export default function AdminMedia() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; filename?: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "linked" | "unlinked">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc" | "size">("newest");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [q, setQ] = useState("");
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  async function load() {
    setLoading(true);
    const rawItems: MediaItem[] = [];
    const seenUrls = new Set<string>();

    try {
      // 1. Fetch all store entities to build bidirectional lookup and sync all product images/videos
      const [productsRes, productImgsRes, categoriesRes, bannersRes, videosRes] = await Promise.all([
        supabase.from("products").select("id, name, slug, text_style, video_url, categories(name)"),
        supabase.from("product_images").select("product_id, url, sort_order, products(id, name, slug, categories(name))"),
        supabase.from("categories").select("id, name, image_url, video_url"),
        supabase.from("banners").select("id, title, image_url, video_url, position"),
        supabase.from("site_videos").select("id, title, video_url, poster_url"),
      ]);

      // URL-to-Entity lookup map with clean human-readable naming
      const urlUsageMap = new Map<string, { type: "product" | "category" | "banner" | "video"; id: string; name: string; extra?: string; cleanName: string }>();

      // Index product gallery images
      (productImgsRes.data ?? []).forEach((pi: any) => {
        if (pi.url) {
          const prodName = pi.products?.name || "Product";
          const orderNum = (pi.sort_order ?? 0) + 1;
          const cleanName = `${prodName} — Image #${orderNum}`;

          urlUsageMap.set(pi.url, {
            type: "product",
            id: pi.product_id || pi.products?.id,
            name: prodName,
            extra: pi.products?.categories?.name ? `Category: ${pi.products.categories.name}` : undefined,
            cleanName,
          });
        }
      });

      // Index product hover images & video reels
      (productsRes.data ?? []).forEach((p: any) => {
        const textStyle = (p.text_style ?? {}) as any;
        if (textStyle.hover_image_url) {
          urlUsageMap.set(textStyle.hover_image_url, {
            type: "product",
            id: p.id,
            name: `${p.name} (Hover View)`,
            extra: p.categories?.name ? `Category: ${p.categories.name}` : undefined,
            cleanName: `${p.name} — Hover View Image`,
          });
        }
        if (p.video_url) {
          urlUsageMap.set(p.video_url, {
            type: "product",
            id: p.id,
            name: `${p.name} (Video)`,
            extra: p.categories?.name ? `Category: ${p.categories.name}` : undefined,
            cleanName: `${p.name} — Product Video Reel`,
          });
        }
      });

      // Index category images & videos
      (categoriesRes.data ?? []).forEach((c: any) => {
        if (c.image_url) {
          urlUsageMap.set(c.image_url, {
            type: "category",
            id: c.id,
            name: `Category: ${c.name}`,
            cleanName: `Category Cover — ${c.name}`,
          });
        }
        if (c.video_url) {
          urlUsageMap.set(c.video_url, {
            type: "category",
            id: c.id,
            name: `Category Video: ${c.name}`,
            cleanName: `Category Video — ${c.name}`,
          });
        }
      });

      // Index banners
      (bannersRes.data ?? []).forEach((b: any) => {
        if (b.image_url) {
          urlUsageMap.set(b.image_url, {
            type: "banner",
            id: b.id,
            name: b.title ? `Banner: ${b.title}` : `Banner (${b.position})`,
            extra: `Position: ${b.position}`,
            cleanName: b.title ? `Hero Banner — ${b.title}` : `Storefront Banner (${b.position})`,
          });
        }
        if (b.video_url) {
          urlUsageMap.set(b.video_url, {
            type: "banner",
            id: b.id,
            name: `Banner Video: ${b.title || b.position}`,
            cleanName: `Hero Banner Video — ${b.title || b.position}`,
          });
        }
      });

      // Index site videos
      (videosRes.data ?? []).forEach((v: any) => {
        if (v.video_url) {
          urlUsageMap.set(v.video_url, {
            type: "video",
            id: v.id,
            name: v.title ? `The KP Chapter: ${v.title}` : "The KP Chapter Reel",
            cleanName: v.title ? `The KP Chapter — ${v.title}` : "The KP Chapter Reel",
          });
        }
        if (v.poster_url) {
          urlUsageMap.set(v.poster_url, {
            type: "video",
            id: v.id,
            name: `The KP Chapter Poster: ${v.title || "Reel"}`,
            cleanName: `The KP Chapter Poster — ${v.title || "Reel"}`,
          });
        }
      });

      // 2. Scan Storage Buckets & Folders
      for (const bucket of BUCKETS) {
        for (const folder of FOLDERS) {
          try {
            const { data } = await supabase.storage.from(bucket).list(folder, {
              limit: 100,
              sortBy: { column: "created_at", order: "desc" },
            });

            (data ?? [])
              .filter((f) => f.id && f.name && !f.name.startsWith("."))
              .forEach((f) => {
                const fullPath = folder ? `${folder}/${f.name}` : f.name;
                const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(fullPath);
                const publicUrl = pubData?.publicUrl || "";

                // Strict Deduplication key
                const dedupKey = `${bucket}/${fullPath}`.toLowerCase();
                if (seenUrls.has(dedupKey) || seenUrls.has(publicUrl)) return;
                seenUrls.add(dedupKey);
                if (publicUrl) seenUrls.add(publicUrl);

                // Match linked resource
                let linked = urlUsageMap.get(publicUrl) || null;
                if (!linked) {
                  for (const [u, entity] of urlUsageMap.entries()) {
                    if (u.endsWith(f.name) || u.includes(fullPath)) {
                      linked = entity;
                      break;
                    }
                  }
                }

                rawItems.push({
                  bucket,
                  folder: folder || "root",
                  path: fullPath,
                  name: f.name,
                  displayName: linked?.cleanName || f.name.replace(/[-_]+/g, " ").replace(/\.[^/.]+$/, ""),
                  url: publicUrl,
                  size: (f.metadata as any)?.size ?? 0,
                  createdAt: (f as any).created_at ?? "",
                  linkedEntity: linked,
                });
              });
          } catch {
            // ignore empty bucket/folder errors
          }
        }
      }

      // 3. Ensure all live product images/videos in database are synced into the media view even if stored on CDN or root
      for (const [url, entity] of urlUsageMap.entries()) {
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          const filename = url.split("/").pop()?.split("?")[0] || "product-media";

          rawItems.push({
            bucket: "products",
            folder: "products",
            path: `products/${filename}`,
            name: filename,
            displayName: entity.cleanName,
            url: url,
            size: 256 * 1024,
            createdAt: new Date().toISOString(),
            linkedEntity: entity,
          });
        }
      }

      rawItems.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setItems(rawItems);
    } catch (e) {
      console.error("Error loading media library:", e);
      toast.error("Failed to load media assets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const foldersList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.folder));
    return ["all", ...Array.from(set)];
  }, [items]);

  const shown = useMemo(() => {
    let list = items.filter((i) => {
      const isVid = isVideoUrl(i.path) || isVideoUrl(i.url);
      if (filter === "image" && isVid) return false;
      if (filter === "video" && !isVid) return false;
      if (filter === "linked" && !i.linkedEntity) return false;
      if (filter === "unlinked" && i.linkedEntity) return false;
      if (selectedFolder !== "all" && i.folder !== selectedFolder) return false;

      const term = q.toLowerCase();
      return (
        i.displayName.toLowerCase().includes(term) ||
        i.name.toLowerCase().includes(term) ||
        i.bucket.toLowerCase().includes(term) ||
        i.folder.toLowerCase().includes(term) ||
        i.linkedEntity?.name.toLowerCase().includes(term) ||
        i.linkedEntity?.extra?.toLowerCase().includes(term)
      );
    });

    switch (sortBy) {
      case "newest":
        list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        break;
      case "oldest":
        list.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
        break;
      case "name_asc":
        list.sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      case "name_desc":
        list.sort((a, b) => b.displayName.localeCompare(a.displayName));
        break;
      case "size":
        list.sort((a, b) => b.size - a.size);
        break;
    }

    return list;
  }, [items, filter, selectedFolder, q, sortBy]);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    const fileArray = Array.from(files);
    setBusy(true);
    setUploadProgress({ current: 0, total: fileArray.length });
    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress({ current: i + 1, total: fileArray.length, filename: file.name });
        await uploadMedia(file, "uploads");
      }
      toast.success(`Successfully uploaded ${fileArray.length} asset(s) to cloud media library`);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      setUploadProgress(null);
    }
  }

  function handleItemSelect(url: string) {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  }

  function selectAllShown() {
    if (selectedUrls.length === shown.length) {
      setSelectedUrls([]);
    } else {
      setSelectedUrls(shown.map((i) => i.url));
    }
  }

  function copySelectedUrls() {
    if (selectedUrls.length === 0) return;
    navigator.clipboard.writeText(selectedUrls.join("\n"));
    toast.success(`Copied ${selectedUrls.length} media URLs in exact sequence`);
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selectedUrls.length} selected assets permanently from storage?`)) return;
    setBusy(true);
    try {
      for (const url of selectedUrls) {
        await deleteMediaFromStorage(url);
        const item = items.find((i) => i.url === url);
        if (item?.bucket && item?.path) {
          await supabase.storage.from(item.bucket).remove([item.path]);
        }
      }
      toast.success(`Deleted ${selectedUrls.length} media assets`);
      setItems((s) => s.filter((i) => !selectedUrls.includes(i.url)));
      setSelectedUrls([]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete selected assets");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.displayName}" permanently from storage?`)) return;
    await deleteMediaFromStorage(item.url);
    if (item.bucket && item.path) {
      await supabase.storage.from(item.bucket).remove([item.path]);
    }
    toast.success("Deleted from storage & media library");
    setItems((s) => s.filter((i) => i.url !== item.url));
    if (previewItem?.url === item.url) setPreviewItem(null);
  }

  function handleEntityClick(entity: NonNullable<MediaItem["linkedEntity"]>) {
    switch (entity.type) {
      case "product":
        navigate(`/admin/products`);
        break;
      case "category":
        navigate(`/admin/categories`);
        break;
      case "banner":
        navigate(`/admin/banners`);
        break;
      case "video":
        navigate(`/admin/videos`);
        break;
    }
  }

  return (
    <div className="max-w-7xl pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border/50">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-foreground flex items-center gap-2.5">
            <Layers className="text-accent" size={26} /> Cloud Media Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            All live product images, hover views, video reels, and banners synchronized with clean names and sequence numbers.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              if (isSelectMode) setSelectedUrls([]);
            }}
            className={`flex items-center gap-1.5 text-xs uppercase tracking-widest px-4 py-2.5 rounded-full transition-all cursor-pointer border ${
              isSelectMode
                ? "bg-accent text-accent-foreground border-accent font-bold shadow-sm"
                : "bg-secondary/70 hover:bg-secondary text-foreground border-border/60"
            }`}
          >
            <ListOrdered size={14} /> {isSelectMode ? "Exit Select Mode" : "Multi-Select & Sequence"}
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-foreground hover:bg-secondary bg-secondary/70 border border-border/60 px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <RefreshCw size={13} /> Refresh Library
          </button>
        </div>
      </div>

      {/* Floating Multi-Action Sequence Toolbar */}
      {selectedUrls.length > 0 && (
        <div className="sticky top-4 z-40 bg-card/95 backdrop-blur-md border border-accent/40 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 flex-wrap animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-mono text-[11px] font-bold">
              {selectedUrls.length}
            </span>
            <span>Assets selected in click sequence (#1 – #{selectedUrls.length})</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={copySelectedUrls}
              className="flex items-center gap-1 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
            >
              <Copy size={12} /> Copy All ({selectedUrls.length})
            </button>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={busy}
              className="flex items-center gap-1 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Trash2 size={12} /> Delete ({selectedUrls.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedUrls([])}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <label className="block cursor-pointer rounded-3xl border border-dashed border-border/80 bg-secondary/15 hover:bg-secondary/30 px-6 py-7 text-center text-xs text-muted-foreground transition-all shadow-xs group">
        {busy ? (
          <div className="flex flex-col items-center justify-center gap-2 text-accent font-medium">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Loader2 size={18} className="animate-spin" />
              {uploadProgress
                ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} assets to cloud storage...`
                : "Uploading assets to cloud storage..."}
            </span>
            {uploadProgress?.filename && (
              <span className="text-[11px] text-muted-foreground font-mono truncate max-w-sm">
                Current: {uploadProgress.filename}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <span className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
              <UploadCloud size={20} className="text-accent" /> Upload images or videos (select/drag multiple files at once)
            </span>
            <p className="text-[11px] text-muted-foreground">
              Files are automatically named, optimized in cloud storage, and indexed across products, categories, and banners
            </p>
          </div>
        )}
        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => onUpload(e.target.files)} />
      </label>

      {/* Filter Toolbar */}
      <div className="glass-card rounded-2xl p-3 space-y-3 border border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Media Type & Link Filters */}
          <div className="flex flex-wrap gap-1.5 bg-secondary/50 p-1 rounded-full border border-border/40">
            {(["all", "image", "video", "linked", "unlinked"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1 rounded-full text-xs capitalize transition-all cursor-pointer ${
                  filter === f
                    ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all"
                  ? `All Assets (${items.length})`
                  : f === "image"
                  ? "Images Only"
                  : f === "video"
                  ? "Videos Only"
                  : f === "linked"
                  ? "Used in Store"
                  : "Unlinked"}
              </button>
            ))}
          </div>

          {/* Sorter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
              <ArrowUpDown size={12} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-secondary/70 rounded-full px-3 py-1.5 text-xs font-mono outline-none border border-border/40 focus:border-accent cursor-pointer"
            >
              <option value="newest">Recent / Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name A → Z</option>
              <option value="name_desc">Name Z → A</option>
              <option value="size">File Size (Largest)</option>
            </select>
          </div>

          {/* Directory / Folder Select */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
              <Folder size={12} /> Folder:
            </span>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="bg-secondary/70 rounded-full px-3 py-1.5 text-xs font-mono outline-none border border-border/40 focus:border-accent cursor-pointer"
            >
              {foldersList.map((f) => (
                <option key={f} value={f}>
                  {f === "all" ? "All Folders" : `/${f}`}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search clean name, product, folder..."
              className="w-full bg-secondary/60 rounded-full pl-8 pr-4 py-1.5 text-xs outline-none border border-border/40 focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin text-accent" /> Loading and synchronizing all product media...
        </div>
      ) : shown.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-foreground glass-card rounded-3xl border border-dashed border-border p-8">
          No media files match your active filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shown.map((item) => {
            const isVid = isVideoUrl(item.path) || isVideoUrl(item.url);
            const selectionRank = selectedUrls.indexOf(item.url);
            const isSelected = selectionRank !== -1;

            return (
              <div
                key={`${item.bucket}-${item.path}-${item.url}`}
                className={`rounded-2xl overflow-hidden glass-card border transition-all flex flex-col justify-between group shadow-xs bg-card/75 ${
                  isSelected
                    ? "border-accent ring-2 ring-accent/40 bg-accent/5"
                    : "border-border/60 hover:border-accent/40"
                }`}
              >
                {/* Thumbnail / Lightbox Trigger */}
                <div
                  onClick={() => {
                    if (isSelectMode) {
                      handleItemSelect(item.url);
                    } else {
                      setPreviewItem(item);
                    }
                  }}
                  className="aspect-square bg-secondary/40 relative overflow-hidden flex items-center justify-center cursor-pointer select-none"
                  title={isSelectMode ? "Click to toggle selection & sequence rank" : "Click to view full-size lightbox preview"}
                >
                  {isVid ? (
                    <video src={item.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.displayName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Directory / Folder Badge */}
                  <span className="absolute top-2 left-2 bg-background/90 backdrop-blur text-[9px] px-2 py-0.5 rounded-full font-mono font-medium text-foreground flex items-center gap-1 shadow-xs">
                    <Folder size={9} className="text-accent" />
                    /{item.folder}
                  </span>

                  {/* Top Right: Selection Checkbox / Sequence Rank Badge OR Video Badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {isSelectMode ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemSelect(item.url);
                        }}
                        className={`w-6 h-6 rounded-full font-mono text-[11px] font-bold flex items-center justify-center shadow transition-all ${
                          isSelected
                            ? "bg-accent text-accent-foreground scale-110"
                            : "bg-background/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isSelected ? `#${selectionRank + 1}` : <Square size={12} />}
                      </button>
                    ) : (
                      <>
                        {isVid ? (
                          <span className="bg-accent text-accent-foreground p-1 rounded-full shadow-xs">
                            <Video size={10} />
                          </span>
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur p-1 rounded-full text-foreground shadow-xs transition-opacity">
                            <Eye size={11} />
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Card Content & Usage Link */}
                <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                  <div>
                    {/* Clean Human-Readable Name */}
                    <p className="text-xs font-semibold line-clamp-2 text-foreground" title={item.displayName}>
                      {item.displayName}
                    </p>

                    {/* File Path / Bucket */}
                    <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5" title={item.name}>
                      {item.name}
                    </p>

                    {/* Linked Entity Badge */}
                    {item.linkedEntity ? (
                      <button
                        type="button"
                        onClick={() => handleEntityClick(item.linkedEntity!)}
                        className="mt-2 w-full text-left p-1.5 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent transition-colors block cursor-pointer"
                        title={`Linked to ${item.linkedEntity.name}. Click to view/edit.`}
                      >
                        <div className="flex items-center gap-1 text-[10px] font-semibold truncate">
                          <LinkIcon size={10} className="flex-shrink-0" />
                          <span className="truncate">{item.linkedEntity.name}</span>
                        </div>
                        {item.linkedEntity.extra && (
                          <span className="text-[9px] text-muted-foreground block truncate pl-3.5">
                            {item.linkedEntity.extra}
                          </span>
                        )}
                      </button>
                    ) : (
                      <span className="mt-2 inline-block text-[9px] text-muted-foreground/60 italic">
                        Unattached asset
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex gap-1.5 pt-2 border-t border-border/40">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        toast.success("Direct URL copied to clipboard!");
                      }}
                      className="flex-1 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider bg-secondary/80 hover:bg-secondary text-foreground rounded-lg py-1.5 transition-colors font-semibold cursor-pointer"
                      title="Copy Public URL"
                    >
                      <Copy size={11} /> Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Preview in Lightbox"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors cursor-pointer"
                      title="Delete permanently"
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

      {/* Lightbox / High-Res Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-3xl rounded-3xl border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-secondary/40">
              <div className="min-w-0 pr-4">
                <h3 className="font-serif text-lg font-semibold truncate text-foreground">{previewItem.displayName}</h3>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {previewItem.url}
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-black/40">
              {isVideoUrl(previewItem.path) || isVideoUrl(previewItem.url) ? (
                <video src={previewItem.url} controls autoPlay className="max-h-[60vh] max-w-full rounded-2xl shadow-xl" />
              ) : (
                <img src={previewItem.url} alt={previewItem.displayName} className="max-h-[60vh] max-w-full object-contain rounded-2xl shadow-xl" />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between bg-secondary/30 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {previewItem.linkedEntity && (
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                    Linked to: {previewItem.linkedEntity.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                >
                  <ExternalLink size={13} /> Open Original
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(previewItem.url);
                    toast.success("URL copied to clipboard!");
                  }}
                  className="flex items-center gap-1.5 bg-[#2D1219] hover:bg-black text-white px-5 py-2 rounded-full text-xs font-semibold transition-colors shadow-md"
                >
                  <Copy size={13} /> Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
