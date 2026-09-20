import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Jammu & Kashmir", "Chandigarh",
];

type Row = { pincode: string; city: string; state: string; delivery_days: number };
const empty: Row = { pincode: "", city: "", state: "Maharashtra", delivery_days: 4 };

export default function AdminAreas() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Row>({ ...empty });

  const { data } = useQuery({
    queryKey: ["service_areas"],
    queryFn: async () => (await supabase.from("service_areas").select("*").order("pincode")).data ?? [],
  });

  const add = useMutation({
    mutationFn: async (r: Row) =>
      (await supabase.from("service_areas").upsert(
        { pincode: r.pincode, city: r.city, state: r.state, delivery_days: Number(r.delivery_days) },
        { onConflict: "pincode" },
      )).error,
    onSuccess: (err) => {
      if (err) return toast.error(err.message);
      toast.success("Delivery area saved");
      setForm({ ...empty });
      qc.invalidateQueries({ queryKey: ["service_areas"] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) =>
      (await supabase.from("service_areas").update(patch).eq("id", id)).error,
    onSuccess: (err) => { if (err) return toast.error(err.message); qc.invalidateQueries({ queryKey: ["service_areas"] }); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => (await supabase.from("service_areas").delete().eq("id", id)).error,
    onSuccess: (err) => { if (err) return toast.error(err.message); qc.invalidateQueries({ queryKey: ["service_areas"] }); },
  });

  const input = "w-full bg-secondary/60 rounded-xl px-3 py-2 text-sm outline-none";
  const label = "text-[10px] uppercase tracking-widest text-muted-foreground";

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl mb-1">Delivery Areas</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Pincodes listed here get a happy “yes, we deliver” in the storefront popup. Anything else gets a
        gentle “not there yet” note.
      </p>

      <div data-tour="areas-form" className="glass-card rounded-2xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <div data-tour="areas-pincode">
          <label className={label}>Pincode</label>
          <input className={input} inputMode="numeric" maxLength={6} placeholder="400001"
            value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} />
        </div>
        <div>
          <label className={label}>City</label>
          <input className={input} placeholder="Mumbai" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <label className={label}>State</label>
          <select className={input} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Days</label>
          <input type="number" min={1} className={input} value={form.delivery_days}
            onChange={(e) => setForm({ ...form, delivery_days: Number(e.target.value) })} />
        </div>
        <div className="col-span-2 md:col-span-4">
          <button
            data-tour="areas-add"
            onClick={() => form.pincode.length === 6 ? add.mutate(form) : toast.error("Enter a 6-digit pincode")}
            className="flex items-center gap-1 bg-accent text-accent-foreground px-5 py-2.5 rounded-full text-xs uppercase tracking-widest"
          >
            <Plus size={14} /> Add area
          </button>
        </div>
      </div>

      <div data-tour="areas-list" className="space-y-2">
        {(data ?? []).map((a: any) => (
          <div key={a.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{a.pincode} · {a.city}</p>
              <p className="text-xs text-muted-foreground">{a.state} · {a.delivery_days} day delivery</p>
            </div>
            <label className="text-xs flex items-center gap-1.5">
              <input type="checkbox" checked={a.is_active}
                onChange={(e) => update.mutate({ id: a.id, patch: { is_active: e.target.checked } })} /> Active
            </label>
            <button onClick={() => confirm("Delete this area?") && del.mutate(a.id)} className="p-2 text-destructive"><Trash2 size={14} /></button>
          </div>
        ))}
        {!data?.length && <p className="text-sm text-muted-foreground">No areas yet — add your first pincode above.</p>}
      </div>
    </div>
  );
}
