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

type Row = { id?: string; slug: string; title: string; content: string; hero_image_url?: string | null; hero_video_url?: string | null; is_active: boolean; sort_order: number; text_style?: StyleMap };
const empty: Row = { slug: "", title: "", content: "", hero_image_url: "", hero_video_url: "", is_active: true, sort_order: 0, text_style: {} };

export default function AdminPages() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Row | null>(null);
  const [isArrangeOpen, setIsArrangeOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => (await supabase.from("info_pages").select("*").order("sort_order")).data ?? [],
  });

  const arrangeItems: ArrangeItem[] = useMemo(() => {
    return (data ?? []).map((p: any) => ({
      id: p.id,
      name: p.title || "Untitled Page",
      sort_order: p.sort_order ?? 0,
      image: p.hero_image_url ?? null,
      subtitle: `/${p.slug}`,
    }));
  }, [data]);

  const save = useMutation({
    mutationFn: async (r: Row) => {
      const payload = { slug: r.slug, title: r.title, content: r.content, hero_image_url: r.hero_image_url || null, hero_video_url: r.hero_video_url || null, is_active: r.is_active, sort_order: Number(r.sort_order), text_style: (r.text_style ?? {}) as any };
      const { error } = await saveRecord({ table: "info_pages", id: r.id ?? null, payload, label: r.title ?? null });
      return error;
    },
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Saved");
      setForm(null);
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      qc.invalidateQueries({ queryKey: ["info-page"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const target = (data ?? []).find((p: any) => p.id === id);
      if (target) {
        await Promise.allSettled([
          deleteMediaFromStorage(target.hero_image_url),
          deleteMediaFromStorage(target.hero_video_url),
        ]);
      }
      return (await deleteRecord({ table: "info_pages", id, label: target?.title })).error;
    },
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Page & associated media deleted from database and storage");
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      qc.invalidateQueries({ queryKey: ["info-page"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  const input = "w-full bg-secondary/60 rounded-xl px-3 py-2 text-sm outline-none";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl">Pages</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Static & policy info pages sequence and content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsArrangeOpen(true)}
            className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer"
            title="Arrange pages display sequence"
          >
            <ArrowUpDown size={14} className="text-accent" /> Arrange
          </button>
          <button data-tour="new-item" onClick={() => setForm({ ...empty })} className="flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold shadow hover:opacity-90 transition-all cursor-pointer">
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <ArrangeManager
        isOpen={isArrangeOpen}
        onClose={() => setIsArrangeOpen(false)}
        title="Arrange Pages Sequence"
        tableName="info_pages"
        items={arrangeItems}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin-pages"] });
        }}
      />

      <p className="text-xs text-muted-foreground mb-4">Pages appear at /page/&lt;slug&gt;. Start a line with "## " to make it a heading.</p>

      {form && (
        <div className="glass-card rounded-2xl p-4 mb-6 space-y-2">
          <input className={input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: !form.id ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : form.slug })} />
          <input className={input} placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <textarea className={input + " font-mono"} rows={14} placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <div data-tour="record-style">
            <TextStyleEditor
              title="Text styling for this page"
              hint="Set the look of this page's title and body copy."
              fields={RECORD_FIELDS.info_pages}
              value={(form.text_style ?? {}) as StyleMap}
              onChange={(v) => setForm({ ...form, text_style: v })}
            />
          </div>
          <MediaUpload label="Header image (optional)" value={form.hero_image_url ?? ""} onChange={(v) => setForm({ ...form, hero_image_url: v })} accept="image" folder="pages" />
          <MediaUpload label="Header video (optional)" value={form.hero_video_url ?? ""} onChange={(v) => setForm({ ...form, hero_video_url: v })} accept="video" folder="pages" />
          <div className="flex gap-3 items-center">
            <input type="number" className={input + " w-24"} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          </div>
          <div className="flex gap-2 pt-2">
            <PreviewButton target="pages" path={`/page/${form.slug}`} draft={{ table: "info_pages", id: form.id ?? null, values: form as any }} label="Preview Changes" />
            <button onClick={() => save.mutate(form)} className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-xs uppercase tracking-widest">Save</button>
            <button onClick={() => setForm(null)} className="border border-border px-5 py-2 rounded-full text-xs uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {(data ?? []).map((p, idx) => (
          <div key={p.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-secondary/80 text-muted-foreground font-mono text-xs font-bold flex items-center justify-center flex-shrink-0" title={`Sequence #${(p.sort_order ?? 0) + 1}`}>
              #{(p.sort_order ?? idx) + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground">/page/{p.slug}</p>
            </div>
            <PreviewButton target="pages" itemId={p.id} path={`/page/${p.slug}`} label="Preview" className="shrink-0" />
            <button onClick={() => setForm(p as Row)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer" title="Edit page"><Edit size={14} /></button>
            <button onClick={() => confirm("Delete?") && del.mutate(p.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg cursor-pointer" title="Delete page"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

