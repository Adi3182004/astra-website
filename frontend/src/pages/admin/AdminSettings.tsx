import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { SHOW_PINCODE_FEATURE } from "@/components/PincodeDialog";
import { deleteMediaFromStorage } from "@/lib/media";

export default function AdminSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["site_settings"], queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data });
  const [form, setForm] = useState({ whatsapp_number: "", contact_email: "", brand_tagline: "", announcement: "" });
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [pincodeImages, setPincodeImages] = useState<string[]>([]);
  const [newPlaceholder, setNewPlaceholder] = useState("");
  const [newImage, setNewImage] = useState("");

  const [filterConfig, setFilterConfig] = useState({
    enablePrice: true,
    enableSort: true,
    enableAvailability: true,
    enableDiscount: true,
    enableOccasion: true,
  });

  useEffect(() => {
    if (!data) return;
    setForm({ whatsapp_number: data.whatsapp_number, contact_email: data.contact_email, brand_tagline: data.brand_tagline, announcement: data.announcement ?? "" });
    setPlaceholders(data.search_placeholders ?? []);
    setPincodeImages(data.pincode_images ?? []);
    if ((data.theme as any)?.filter_config) {
      setFilterConfig({ ...filterConfig, ...(data.theme as any).filter_config });
    }
  }, [data]);

  async function save() {
    const updatedTheme = {
      ...(data?.theme || {}),
      filter_config: filterConfig,
    };

    const { error } = await supabase
      .from("site_settings")
      .update({
        ...form,
        announcement: form.announcement || null,
        search_placeholders: placeholders,
        pincode_images: pincodeImages,
        theme: updatedTheme,
      })
      .eq("id", 1);
    if (error) toast.error(error.message);
    else {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    }
  }

  async function removePincodeImage(index: number, src: string) {
    await deleteMediaFromStorage(src);
    setPincodeImages(pincodeImages.filter((_, x) => x !== index));
    toast.success("Image removed from sequence and storage");
  }

  const input = "w-full bg-secondary/60 rounded-xl px-3 py-2.5 text-sm outline-none";
  const label = "text-xs uppercase tracking-widest text-muted-foreground";

  return (
    <div className="max-w-lg pb-10">
      <h1 className="font-serif text-3xl mb-6">Settings</h1>
      <div className="space-y-5">
        <div><label className={label}>WhatsApp number (with country code, no +)</label><input className={input} value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="911234567890" /></div>
        <div><label className={label}>Contact email</label><input className={input} value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
        <div><label className={label}>Brand tagline</label><input className={input} value={form.brand_tagline} onChange={(e) => setForm({ ...form, brand_tagline: e.target.value })} /></div>
        <div><label className={label}>Announcement bar (leave empty to hide)</label><input className={input} value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} placeholder="Free shipping this weekend!" /></div>

        {/* Storefront Filter Configuration */}
        <div className="p-4 rounded-2xl border border-border/60 bg-secondary/20">
          <label className="text-xs uppercase tracking-widest font-semibold text-foreground block mb-3">
            Storefront Filter Features
          </label>
          <div className="space-y-2.5">
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span>Sort by Options (Price, Latest, A-Z)</span>
              <input
                type="checkbox"
                checked={filterConfig.enableSort}
                onChange={(e) => setFilterConfig({ ...filterConfig, enableSort: e.target.checked })}
                className="w-4 h-4 accent-accent rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span>Price Range Slider & Presets</span>
              <input
                type="checkbox"
                checked={filterConfig.enablePrice}
                onChange={(e) => setFilterConfig({ ...filterConfig, enablePrice: e.target.checked })}
                className="w-4 h-4 accent-accent rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span>Stock & Availability Filter</span>
              <input
                type="checkbox"
                checked={filterConfig.enableAvailability}
                onChange={(e) => setFilterConfig({ ...filterConfig, enableAvailability: e.target.checked })}
                className="w-4 h-4 accent-accent rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span>Discount & Special Offers Filter</span>
              <input
                type="checkbox"
                checked={filterConfig.enableDiscount}
                onChange={(e) => setFilterConfig({ ...filterConfig, enableDiscount: e.target.checked })}
                className="w-4 h-4 accent-accent rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span>Occasion & Collection Filter</span>
              <input
                type="checkbox"
                checked={filterConfig.enableOccasion}
                onChange={(e) => setFilterConfig({ ...filterConfig, enableOccasion: e.target.checked })}
                className="w-4 h-4 accent-accent rounded"
              />
            </label>
          </div>
        </div>

        <div>
          <label className={label}>Rotating search placeholders</label>
          <div className="flex gap-2 mt-1">
            <input className={input} placeholder="Search for anklets..." value={newPlaceholder} onChange={(e) => setNewPlaceholder(e.target.value)} />
            <button onClick={() => { if (newPlaceholder.trim()) { setPlaceholders([...placeholders, newPlaceholder.trim()]); setNewPlaceholder(""); } }} className="bg-accent text-accent-foreground px-4 rounded-xl"><Plus size={14} /></button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {placeholders.map((p, i) => (
              <span key={i} className="flex items-center gap-1 bg-secondary/60 rounded-full px-3 py-1 text-xs">
                {p}
                <button onClick={() => setPlaceholders(placeholders.filter((_, x) => x !== i))}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        {SHOW_PINCODE_FEATURE && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={label}>Pincode popup images ({pincodeImages.length})</label>
              <span className="text-[10px] text-muted-foreground">Multi-select enabled</span>
            </div>
            <div className="mt-1">
              <MediaUpload
                value={newImage}
                onChange={(url) => {
                  if (url) {
                    setPincodeImages((prev) => [...prev, url]);
                    setNewImage("");
                  }
                }}
                multiple={true}
                onMultipleUpload={(urls) => {
                  setPincodeImages((prev) => [...prev, ...urls]);
                  setNewImage("");
                  toast.success(`Added ${urls.length} images to pincode sequence`);
                }}
                accept="image"
                folder="pincode"
              />
              {newImage && (
                <button
                  type="button"
                  onClick={() => {
                    if (newImage.trim()) {
                      setPincodeImages([...pincodeImages, newImage.trim()]);
                      setNewImage("");
                    }
                  }}
                  className="mt-2 flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest cursor-pointer"
                >
                  <Plus size={14} /> Add image
                </button>
              )}
            </div>
            {pincodeImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                {pincodeImages.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-border/60 bg-card p-1.5 flex flex-col justify-between shadow-xs">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-secondary">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 bg-background/90 backdrop-blur text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs">
                        #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePincodeImage(i, src)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 shadow hover:opacity-90 cursor-pointer"
                        title="Remove image"
                      >
                        <X size={11} />
                      </button>
                    </div>
                    {pincodeImages.length > 1 && (
                      <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-border/40 text-[10px]">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => {
                            const updated = [...pincodeImages];
                            const [moved] = updated.splice(i, 1);
                            updated.splice(i - 1, 0, moved);
                            setPincodeImages(updated);
                          }}
                          className="px-2 py-0.5 rounded bg-secondary/80 hover:bg-secondary disabled:opacity-30 cursor-pointer font-mono"
                          title="Move earlier in sequence"
                        >
                          ←
                        </button>
                        <span className="font-mono text-muted-foreground">Pos {i + 1}</span>
                        <button
                          type="button"
                          disabled={i === pincodeImages.length - 1}
                          onClick={() => {
                            const updated = [...pincodeImages];
                            const [moved] = updated.splice(i, 1);
                            updated.splice(i + 1, 0, moved);
                            setPincodeImages(updated);
                          }}
                          className="px-2 py-0.5 rounded bg-secondary/80 hover:bg-secondary disabled:opacity-30 cursor-pointer font-mono"
                          title="Move later in sequence"
                        >
                          →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={save} className="bg-accent text-accent-foreground px-6 py-3 rounded-full text-xs uppercase tracking-widest shadow-md hover:opacity-90 transition-opacity">
          Save Settings
        </button>
      </div>
    </div>
  );
}
