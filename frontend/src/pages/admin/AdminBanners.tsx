import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { saveRecord, deleteRecord } from "@/lib/audit";
import { PreviewButton } from "@/components/admin/PreviewButton";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit, ArrowUpDown } from "lucide-react";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { TextStyleEditor } from "@/components/admin/TextStyleEditor";
import { RECORD_FIELDS, type StyleMap } from "@/lib/textStyles";
import { ArrangeManager, type ArrangeItem } from "@/components/admin/ArrangeManager";
import { deleteMediaFromStorage } from "@/lib/media";

type Row = { id?: string; title: string; subtitle: string; image_url: string; video_url?: string; cta_label: string; cta_link: string; position: "hero" | "strip" | "collection"; is_active: boolean; sort_order: number; text_style?: StyleMap };
const empty: Row = { title: "", subtitle: "", image_url: "", video_url: "", cta_label: "", cta_link: "", position: "hero", is_active: true, sort_order: 0, text_style: {} };

export default function AdminBanners() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Row | null>(null);
  const [isArrangeOpen, setIsArrangeOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => (await supabase.from("banners").select("*").order("position").order("sort_order")).data ?? [],
  });

  const arrangeItems: ArrangeItem[] = useMemo(() => {
    return (data ?? []).map((b: any) => ({
      id: b.id,
      name: b.title || `Banner (${b.position})`,
      sort_order: b.sort_order ?? 0,
      image: b.image_url ?? null,
      subtitle: `${b.position} · ${b.cta_label || "No CTA"}`,
    }));
  }, [data]);

  const save = useMutation({
    mutationFn: async (r: Row) => {
      const payload: any = { ...r };
      delete payload.id;
      const { error } = await saveRecord({ table: "banners", id: r.id ?? null, payload, label: r.title ?? null });
      return error;
    },
    onSuccess: (err) => { if (err) return toast.error(err.message); toast.success("Saved"); setForm(null); qc.invalidateQueries({ queryKey: ["admin-banners"] }); qc.invalidateQueries({ queryKey: ["banners", "hero"] }); qc.invalidateQueries({ queryKey: ["banners", "strip"] }); qc.invalidateQueries({ queryKey: ["admin-media"] }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const target = (data ?? []).find((b: any) => b.id === id);
      if (target) {
        await Promise.allSettled([
          deleteMediaFromStorage(target.image_url),
          deleteMediaFromStorage((target as any).mobile_image_url),
          deleteMediaFromStorage(target.video_url),
        ]);
      }
      return (await deleteRecord({ table: "banners", id, label: target?.title })).error;
    },
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Banner & associated media deleted from database and storage");
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      qc.invalidateQueries({ queryKey: ["banners", "hero"] });
      qc.invalidateQueries({ queryKey: ["banners", "strip"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  const input = "w-full bg-secondary/60 rounded-xl px-3 py-2 text-sm outline-none";
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl">Banners</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Hero slides, announcement strips, and collection banners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsArrangeOpen(true)}
            className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all"
            title="Arrange banner display sequence"
          >
            <ArrowUpDown size={14} className="text-accent" /> Arrange
          </button>
          <button data-tour="new-item" onClick={() => setForm({ ...empty })} className="flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold shadow hover:opacity-90 transition-all">
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <ArrangeManager
        isOpen={isArrangeOpen}
        onClose={() => setIsArrangeOpen(false)}
        title="Arrange Banners Sequence"
        tableName="banners"
        items={arrangeItems}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin-banners"] });
          qc.invalidateQueries({ queryKey: ["banners", "hero"] });
          qc.invalidateQueries({ queryKey: ["banners", "strip"] });
        }}
      />
      {form && (
        <div className="glass-card rounded-2xl p-4 mb-6 space-y-2">
          <select data-tour="banner-position" className={input} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as any })}>
            <option value="hero">Hero (top carousel)</option>
            <option value="strip">Announcement strip</option>
            <option value="collection">Collection banner</option>
          </select>
          <input className={input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={input} placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <div data-tour="record-style">
          <TextStyleEditor
            title="Text styling for this banner"
            hint="Give this slide its own title, subtitle and button colours."
            fields={RECORD_FIELDS.banners}
            value={(form.text_style ?? {}) as StyleMap}
            onChange={(v) => setForm({ ...form, text_style: v })}
          />
          </div>
          <div data-tour="banner-media" className="space-y-2">
          <MediaUpload label="Banner image" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} accept="image" folder="banners" />
          <MediaUpload label="Banner video (optional, plays over the image)" value={form.video_url ?? ""} onChange={(v) => setForm({ ...form, video_url: v })} accept="video" folder="banners" />
          </div>

          <input className={input} placeholder="CTA label" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} />
          <input className={input} placeholder="CTA link (e.g. /shop or /category/rings)" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} />
          <div className="flex gap-2 items-center">
            <input type="number" className={input + " w-24"} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          </div>
          <div className="flex gap-2 pt-2">
            <PreviewButton target="banners"  draft={{ table: "banners", id: form.id ?? null, values: form as any }} label="Preview Changes" />
            <button onClick={() => save.mutate(form)} className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-xs uppercase tracking-widest">Save</button>
            <button onClick={() => setForm(null)} className="border border-border px-5 py-2 rounded-full text-xs uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {(data ?? []).map((b, idx) => (
          <div key={b.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-secondary/80 text-muted-foreground font-mono text-xs font-bold flex items-center justify-center flex-shrink-0" title={`Sequence #${(b.sort_order ?? 0) + 1}`}>
              #{(b.sort_order ?? idx) + 1}
            </span>
            {b.image_url && <img src={b.image_url} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{b.title || "(no title)"}</p>
              <p className="text-xs text-muted-foreground">{b.position} · {b.is_active ? "Active" : "Hidden"}</p>
            </div>
            <PreviewButton target="banners" itemId={b.id} label="Preview" className="shrink-0" />
            <button onClick={() => setForm(b as any)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer" title="Edit banner"><Edit size={14} /></button>
            <button onClick={() => confirm("Delete?") && del.mutate(b.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg cursor-pointer" title="Delete banner"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
