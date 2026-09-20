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
  author: string;
  rating: number;
  body: string;
  image_url: string | null;
  video_url?: string | null;
  product_id: string | null;
  is_active: boolean;
  sort_order: number;
  text_style?: StyleMap;
};
const empty: Row = { author: "", rating: 5, body: "", image_url: "", video_url: "", product_id: null, is_active: true, sort_order: 0, text_style: {} };

export default function AdminReviews() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Row | null>(null);
  const [isArrangeOpen, setIsArrangeOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => (await supabase.from("reviews").select("*, products(name)").order("sort_order")).data ?? [],
  });
  const { data: products } = useQuery({
    queryKey: ["admin-products-min"],
    queryFn: async () => (await supabase.from("products").select("id,name").order("name")).data ?? [],
  });

  const arrangeItems: ArrangeItem[] = useMemo(() => {
    return (data ?? []).map((r: any) => ({
      id: r.id,
      name: `${r.author} (${r.rating}★)`,
      sort_order: r.sort_order ?? 0,
      image: r.image_url ?? null,
      subtitle: (r.products as any)?.name ? `Review for ${(r.products as any).name}` : "General Review",
    }));
  }, [data]);

  const save = useMutation({
    mutationFn: async (r: Row) => {
      const payload = {
        author: r.author,
        rating: Number(r.rating),
        body: r.body,
        image_url: r.image_url || null,
        video_url: r.video_url || null,
        product_id: r.product_id || null,
        is_active: r.is_active,
        sort_order: Number(r.sort_order),
        text_style: (r.text_style ?? {}) as any,
      };
      const { error } = await saveRecord({ table: "reviews", id: r.id ?? null, payload, label: r.author ?? null });
      return error;
    },
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Saved");
      setForm(null);
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const target = (data ?? []).find((r: any) => r.id === id);
      if (target) {
        await Promise.allSettled([
          deleteMediaFromStorage(target.image_url),
          deleteMediaFromStorage(target.video_url),
        ]);
      }
      return (await deleteRecord({ table: "reviews", id, label: target?.author })).error;
    },
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Review & associated media deleted from database and storage");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  const input = "w-full bg-secondary/60 rounded-xl px-3 py-2 text-sm outline-none";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl">Reviews</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage customer testimonials and sequence order
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsArrangeOpen(true)}
            className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 border border-border/60 text-foreground px-4 py-2 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer"
            title="Arrange review display sequence"
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
        title="Arrange Reviews Sequence"
        tableName="reviews"
        items={arrangeItems}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin-reviews"] });
          qc.invalidateQueries({ queryKey: ["reviews"] });
        }}
      />

      {form && (
        <div className="glass-card rounded-2xl p-4 mb-6 space-y-2">
          <input className={input} placeholder="Customer name" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <textarea className={input} rows={3} placeholder="Review text" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <div data-tour="record-style">
            <TextStyleEditor
              title="Text styling for this review"
              hint="Colour the reviewer name and their words for this review only."
              fields={RECORD_FIELDS.reviews}
              value={(form.text_style ?? {}) as StyleMap}
              onChange={(v) => setForm({ ...form, text_style: v })}
            />
          </div>
          <MediaUpload label="Review image (optional)" value={form.image_url ?? ""} onChange={(v) => setForm({ ...form, image_url: v })} accept="image" folder="reviews" />
          <MediaUpload label="Review video (optional)" value={form.video_url ?? ""} onChange={(v) => setForm({ ...form, video_url: v })} accept="video" folder="reviews" />
          <select className={input} value={form.product_id ?? ""} onChange={(e) => setForm({ ...form, product_id: e.target.value || null })}>
            <option value="">— No product —</option>
            {products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex gap-2 items-center flex-wrap">
            <label className="text-xs text-muted-foreground">Rating</label>
            <input type="number" min={1} max={5} className={input + " w-20"} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            <label className="text-xs text-muted-foreground">Sort</label>
            <input type="number" className={input + " w-20"} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
          </div>
          <div className="flex gap-2 pt-2">
            <PreviewButton target="reviews"  draft={{ table: "reviews", id: form.id ?? null, values: form as any }} label="Preview Changes" />
            <button onClick={() => save.mutate(form)} className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-xs uppercase tracking-widest">Save</button>
            <button onClick={() => setForm(null)} className="border border-border px-5 py-2 rounded-full text-xs uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {(data ?? []).map((r, idx) => (
          <div key={r.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-secondary/80 text-muted-foreground font-mono text-xs font-bold flex items-center justify-center flex-shrink-0" title={`Sequence #${(r.sort_order ?? 0) + 1}`}>
              #{(r.sort_order ?? idx) + 1}
            </span>
            {r.image_url && <img src={r.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{r.author} · {"★".repeat(r.rating)}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{r.body}</p>
            </div>
            <PreviewButton target="reviews" itemId={r.id} label="Preview" className="shrink-0" />
            <button onClick={() => setForm(r as Row)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer" title="Edit review"><Edit size={14} /></button>
            <button onClick={() => confirm("Delete?") && del.mutate(r.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-lg cursor-pointer" title="Delete review"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

