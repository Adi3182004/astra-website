import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { rollback, type AuditEntry } from "@/lib/audit";
import { useState } from "react";
import { toast } from "sonner";
import { Undo2, Plus, Pencil, Trash2 } from "lucide-react";

const ICON = { create: Plus, update: Pencil, delete: Trash2 } as const;

/** Versioned change log with one-click rollback for every published edit. */
export default function AdminHistory() {
  const qc = useQueryClient();
  const [section, setSection] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async () =>
      ((await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200)).data ?? []) as unknown as AuditEntry[],
  });

  const sections = Array.from(new Set((data ?? []).map((e) => e.section)));
  const rows = (data ?? []).filter((e) => section === "all" || e.section === section);

  async function undo(entry: AuditEntry) {
    if (!confirm(`Roll back this ${entry.action} in ${entry.section}?`)) return;
    setBusy(entry.id);
    const { error } = await rollback(entry);
    setBusy(null);
    if (error) return toast.error(error.message ?? "Could not roll back");
    toast.success("Change rolled back");
    qc.invalidateQueries();
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="font-serif text-3xl">Change history</h1>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="bg-secondary/60 rounded-xl px-3 py-2 text-sm outline-none"
        >
          <option value="all">All sections</option>
          {sections.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {!rows.length && (
        <p className="text-sm text-muted-foreground">
          No changes recorded yet. Every edit you publish from the admin will appear here with a one-click undo.
        </p>
      )}

      <div className="space-y-2">
        {rows.map((e) => {
          const Icon = ICON[e.action] ?? Pencil;
          return (
            <div key={e.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-secondary/70 flex items-center justify-center shrink-0">
                <Icon size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {e.section} · {e.label || e.record_id?.slice(0, 8) || "record"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {e.action} · {new Date(e.created_at).toLocaleString()} · {e.actor_email ?? "unknown"}
                  {e.rolled_back && " · rolled back"}
                </p>
              </div>
              <button
                disabled={e.rolled_back || busy === e.id}
                onClick={() => undo(e)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-[10px] uppercase tracking-widest disabled:opacity-40"
              >
                <Undo2 size={13} /> {e.rolled_back ? "Undone" : "Undo"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
