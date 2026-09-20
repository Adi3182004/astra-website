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

type Row = { id?: string; name: string; slug: string; image_url: string; video_url?: string; sort_order: number; is_active: boolean; show_in_menu: boolean; text_style?: StyleMap };
const empty: Row = { name: "", slug: "", image_url: "", video_url: "", sort_order: 0, is_active: true, show_in_menu: true, text_style: {} };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Row | null>(null);
  const [isArrangeOpen, setIsArrangeOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const arrangeItems: ArrangeItem[] = useMemo(() => {
    return (data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      sort_order: c.sort_order ?? 0,
      image: c.image_url ?? null,
      subtitle: c.slug,
      created_at: c.created_at,
    }));
  }, [data]);

  const save = useMutation({
    mutationFn: async (r: Row) => {
      const payload = { name: r.name, slug: r.slug, image_url: r.image_url || null, video_url: r.video_url || null, sort_order: Number(r.sort_order), is_active: r.is_active, show_in_menu: r.show_in_menu, text_style: (r.text_style ?? {}) as any };
      const { error } = await saveRecord({ table: "categories", id: r.id ?? null, payload, label: r.name ?? null });
      return error;
    },
    onSuccess: (err) => { if (err) return toast.error(err.message); toast.success("Saved"); setForm(null); qc.invalidateQueries({ queryKey: ["admin-cats"] }); qc.invalidateQueries({ queryKey: ["categories"] }); qc.invalidateQueries({ queryKey: ["categories-nav"] }); qc.invalidateQueries({ queryKey: ["admin-media"] }); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const target = (data ?? []).find((c: any) => c.id === id);
      if (target) {
        await Promise.allSettled([
          deleteMediaFromStorage(target.image_url),
          deleteMediaFromStorage(target.video_url),
        ]);
      }
      return (await deleteRecord({ table: "categories", id, label: target?.name })).error;
    },
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Category & media deleted from database and storage");
      qc.invalidateQueries({ queryKey: ["admin-cats"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories-nav"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  const input = "w-full bg-secondary/60 rounded-xl px-3 py-2 text-sm outline-none";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl">Categories</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage category order, navigation visibility, and media
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsArrangeOpen(true)}
            className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all"
            title="Arrange category display sequence"
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
        title="Arrange Categories Sequence"
        tableName="categories"
        items={arrangeItems}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin-cats"] });
          qc.invalidateQueries({ queryKey: ["categories"] });
          qc.invalidateQueries({ queryKey: ["categories-nav"] });
        }}
      />
      {form && (
        <div className="glass-card rounded-2xl p-4 mb-6 space-y-2">
          <input className={input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: !form.id ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : form.slug })} />
          <input className={input} placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <div data-tour="record-style">
            <TextStyleEditor
              title="Text styling for this category"
              hint="Change how this category name looks in the menu and on its tile."
              fields={RECORD_FIELDS.categories}
              value={(form.text_style ?? {}) as StyleMap}
              onChange={(v) => setForm({ ...form, text_style: v })}
            />
          </div>
          <div data-tour="cat-media" className="space-y-2">
          <MediaUpload label="Menu image (shown in hamburger menu)" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} accept="image" folder="categories" />
          <MediaUpload label="Category video (optional)" value={form.video_url ?? ""} onChange={(v) => setForm({ ...form, video_url: v })} accept="video" folder="categories" />
          </div>
          <div data-tour="cat-flags" className="flex gap-4 items-center flex-wrap">
            <input type="number" className={input + " w-24"} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.show_in_menu} onChange={(e) => setForm({ ...form, show_in_menu: e.target.checked })} /> Show in menu</label>
          </div>

          <div className="flex gap-2 pt-2">
            <PreviewButton target="categories"  draft={{ table: "categories", id: form.id ?? null, values: form as any }} label="Preview Changes" />
            <button onClick={() => save.mutate(form)} className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-xs uppercase tracking-widest">Save</button>
            <button onClick={() => setForm(null)} className="border border-border px-5 py-2 rounded-full text-xs uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {(data ?? []).map((c, idx) => (
          <div key={c.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-secondary/80 text-muted-foreground font-mono text-xs font-bold flex items-center justify-center flex-shrink-0" title={`Sequence #${(c.sort_order ?? 0) + 1}`}>
              #{(c.sort_order ?? idx) + 1}
            </span>
            {c.image_url && <img src={c.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground truncate">{c.slug}</p>
            </div>
            <PreviewButton target="categories" itemId={c.id} label="Preview" className="shrink-0" />
            <button onClick={() => setForm(c as any)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer" title="Edit category"><Edit size={14} /></button>
            <button onClick={() => confirm("Delete?") && del.mutate(c.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg cursor-pointer" title="Delete category"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
