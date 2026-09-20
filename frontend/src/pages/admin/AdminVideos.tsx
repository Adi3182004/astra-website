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

type Row = {
  id?: string;
  title: string | null;
  subtitle: string | null;
  video_url: string;
  poster_url: string | null;
  is_active: boolean;
  sort_order: number;
  text_style?: StyleMap;
};
const empty: Row = { title: "", subtitle: "", video_url: "", poster_url: "", is_active: true, sort_order: 0, text_style: {} };

export default function AdminVideos() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Row | null>(null);
  const [isArrangeOpen, setIsArrangeOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => (await supabase.from("site_videos").select("*").order("sort_order")).data ?? [],
  });

  const arrangeItems: ArrangeItem[] = useMemo(() => {
    return (data ?? []).map((v: any) => ({
      id: v.id,
      name: v.title || "Video Reel",
      sort_order: v.sort_order ?? 0,
      image: v.poster_url ?? null,
      subtitle: v.subtitle || "The KP Chapter Reel",
    }));
  }, [data]);

  const save = useMutation({
    mutationFn: async (r: Row) => {
      const payload = {
        title: r.title || null,
        subtitle: r.subtitle || null,
        video_url: r.video_url,
        poster_url: r.poster_url || null,
        is_active: r.is_active,
        sort_order: Number(r.sort_order),
        text_style: (r.text_style ?? {}) as any,
      };
      const { error } = await saveRecord({ table: "site_videos", id: r.id ?? null, payload, label: r.title ?? null });
      return error;
    },
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Saved");
      setForm(null);
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
      qc.invalidateQueries({ queryKey: ["site-videos"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const target = (data ?? []).find((v: any) => v.id === id);
      if (target) {
        await Promise.allSettled([
          deleteMediaFromStorage(target.video_url),
          deleteMediaFromStorage(target.poster_url),
        ]);
      }
      return (await deleteRecord({ table: "site_videos", id, label: target?.title ?? "Video Reel" })).error;
    },
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Video reel & media files deleted from database and storage");
      qc.invalidateQueries({ queryKey: ["admin-videos"] });
      qc.invalidateQueries({ queryKey: ["site-videos"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  const input = "w-full bg-secondary/60 rounded-xl px-3 py-2 text-sm outline-none";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl">The KP Chapter</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Storefront Video Reels / Film showcase on homepage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsArrangeOpen(true)}
            className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer"
            title="Arrange video reels sequence"
          >
            <ArrowUpDown size={14} className="text-accent" /> Arrange
          </button>
          <button onClick={() => setForm({ ...empty })} className="flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold shadow hover:opacity-90 transition-all cursor-pointer">
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <ArrangeManager
        isOpen={isArrangeOpen}
        onClose={() => setIsArrangeOpen(false)}
        title="Arrange The KP Chapter Sequence"
        tableName="site_videos"
        items={arrangeItems}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin-videos"] });
          qc.invalidateQueries({ queryKey: ["site-videos"] });
        }}
      />
      <p className="text-xs text-muted-foreground mb-4">Paste a direct .mp4 link (short clips up to ~10 seconds look best).</p>

      {form && (
        <div className="glass-card rounded-2xl p-4 mb-6 space-y-2">
          <input className={input} placeholder="Title" value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={input} placeholder="Subtitle" value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <div data-tour="record-style">
            <TextStyleEditor
              title="Text styling for this film / reel"
              hint="Customise the font, weight, text colour, and background colour for this reel."
              fields={RECORD_FIELDS.site_videos}
              value={(form.text_style ?? {}) as StyleMap}
              onChange={(v) => setForm({ ...form, text_style: v })}
            />
          </div>
          <MediaUpload label="Video" value={form.video_url} onChange={(v) => setForm({ ...form, video_url: v })} accept="video" folder="videos" />
          <MediaUpload label="Poster image (optional)" value={form.poster_url ?? ""} onChange={(v) => setForm({ ...form, poster_url: v })} accept="image" folder="videos" />
          <div className="flex gap-3 items-center">
            <input type="number" className={input + " w-24"} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          </div>
          <div className="flex gap-2 pt-2">
            <PreviewButton target="videos"  draft={{ table: "site_videos", id: form.id ?? null, values: form as any }} label="Preview Changes" />
            <button onClick={() => save.mutate(form)} className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-xs uppercase tracking-widest">Save</button>
            <button onClick={() => setForm(null)} className="border border-border px-5 py-2 rounded-full text-xs uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {(data ?? []).map((v, idx) => (
          <div key={v.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-secondary/80 text-muted-foreground font-mono text-xs font-bold flex items-center justify-center flex-shrink-0" title={`Sequence #${(v.sort_order ?? 0) + 1}`}>
              #{(v.sort_order ?? idx) + 1}
            </span>
            {v.poster_url && <img src={v.poster_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{v.title ?? "Untitled"}</p>
              <p className="text-xs text-muted-foreground truncate">{v.video_url}</p>
            </div>
            <PreviewButton target="videos" itemId={v.id} label="Preview" className="shrink-0" />
            <button onClick={() => setForm(v as Row)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer" title="Edit video"><Edit size={14} /></button>
            <button onClick={() => confirm("Delete?") && del.mutate(v.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg cursor-pointer" title="Delete video"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
