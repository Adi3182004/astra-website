/**
 * Versioned admin change log.
 *
 * Every create / update / delete made from the admin panel records the row as
 * it looked *before* and *after* the change, so any published update can be
 * rolled back with one click from Admin → History.
 */
import { supabase } from "@/integrations/supabase/client";

export type AuditAction = "create" | "update" | "delete";

export type AuditEntry = {
  id: string;
  actor_email: string | null;
  section: string;
  table_name: string;
  record_id: string | null;
  action: AuditAction;
  label: string | null;
  before_data: Record<string, any> | null;
  after_data: Record<string, any> | null;
  rolled_back: boolean;
  created_at: string;
};

/** Tables the admin panel is allowed to write through the audit helpers. */
export type AuditTable =
  | "banners"
  | "categories"
  | "products"
  | "reviews"
  | "site_videos"
  | "info_pages"
  | "service_areas";

export const SECTION_LABEL: Record<string, string> = {
  banners: "Banners",
  categories: "Categories",
  products: "Products",
  reviews: "Reviews",
  site_videos: "Videos",
  info_pages: "Pages",
  service_areas: "Delivery areas",
};

async function actor() {
  const { data } = await supabase.auth.getUser();
  return { id: data.user?.id ?? null, email: data.user?.email ?? null };
}

async function log(entry: {
  table: AuditTable;
  action: AuditAction;
  recordId: string | null;
  label?: string | null;
  before?: any;
  after?: any;
}) {
  const who = await actor();
  await supabase.from("admin_audit_log").insert({
    actor_id: who.id,
    actor_email: who.email,
    section: SECTION_LABEL[entry.table] ?? entry.table,
    table_name: entry.table,
    record_id: entry.recordId,
    action: entry.action,
    label: entry.label ?? null,
    before_data: entry.before ?? null,
    after_data: entry.after ?? null,
  });
}

/**
 * Insert or update a record and write an audit entry for it.
 * Returns a Supabase-style error (or null) so callers keep their existing shape.
 */
export async function saveRecord(opts: {
  table: AuditTable;
  id?: string | null;
  payload: Record<string, any>;
  label?: string | null;
}): Promise<{ error: any; id: string | null }> {
  const { table, id, payload } = opts;

  if (id) {
    const { data: before } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
    const { data: after, error } = await supabase
      .from(table)
      .update(payload as any)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return { error, id };
    await log({ table, action: "update", recordId: id, label: opts.label, before, after });
    return { error: null, id };
  }

  const { data: after, error } = await supabase
    .from(table)
    .insert(payload as any)
    .select()
    .maybeSingle();
  if (error) return { error, id: null };
  await log({
    table,
    action: "create",
    recordId: after?.id ?? null,
    label: opts.label,
    before: null,
    after,
  });
  return { error: null, id: after?.id ?? null };
}

/** Delete a record, keeping a full copy so it can be restored. */
export async function deleteRecord(opts: {
  table: AuditTable;
  id: string;
  label?: string | null;
}): Promise<{ error: any }> {
  const { data: before } = await supabase.from(opts.table).select("*").eq("id", opts.id).maybeSingle();
  const { error } = await supabase.from(opts.table).delete().eq("id", opts.id);
  if (error) return { error };
  await log({
    table: opts.table,
    action: "delete",
    recordId: opts.id,
    label: opts.label,
    before,
    after: null,
  });
  return { error: null };
}

/** Undo one logged change: restores the "before" state (or removes a creation). */
export async function rollback(entry: AuditEntry): Promise<{ error: any }> {
  const table = entry.table_name as AuditTable;

  if (entry.action === "create") {
    if (!entry.record_id) return { error: new Error("Nothing to remove") };
    const { error } = await supabase.from(table).delete().eq("id", entry.record_id);
    if (error) return { error };
  } else if (entry.action === "delete") {
    if (!entry.before_data) return { error: new Error("No saved copy to restore") };
    const { error } = await supabase.from(table).insert(entry.before_data as any);
    if (error) return { error };
  } else {
    if (!entry.before_data || !entry.record_id) return { error: new Error("No previous version") };
    const { id: _ignored, ...rest } = entry.before_data;
    const { error } = await supabase.from(table).update(rest as any).eq("id", entry.record_id);
    if (error) return { error };
  }

  await supabase.from("admin_audit_log").update({ rolled_back: true }).eq("id", entry.id);
  return { error: null };
}
