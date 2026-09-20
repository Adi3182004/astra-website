import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Download,
  Wand2,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  cancelScan,
  fetchSeoRoutes,
  getScanState,
  readRouteTags,
  rescanRoute,
  startScan,
  subscribeScan,
  type RouteTags,
} from "@/lib/seoScan";

import { loadSeoOverrides } from "@/lib/seo";

/**
 * Admin SEO dashboard.
 *
 * The crawl itself runs as a background job (see `@/lib/seoScan`) so the page
 * stays instantly responsive and the admin can navigate away and come back.
 * Every failing URL can be fixed inline: the editor writes a per-route
 * override that the storefront's `useSeo` applies on top of whatever the page
 * generates, then re-checks just that URL.
 */
type OverrideForm = {
  title: string;
  description: string;
  canonical: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: string;
  json_ld: string;
  no_index: boolean;
};

const EMPTY: OverrideForm = {
  title: "",
  description: "",
  canonical: "",
  og_title: "",
  og_description: "",
  og_image: "",
  twitter_card: "",
  json_ld: "",
  no_index: false,
};

const ADMIN_FOR = (route: string) =>
  route.startsWith("/product/")
    ? "/admin/products"
    : route.startsWith("/category/")
      ? "/admin/categories"
      : route.startsWith("/page/")
        ? "/admin/pages"
        : "/admin/settings";

function Field({
  label,
  hint,
  value,
  onChange,
  textarea,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs"
        />
      )}
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

/**
 * Live preview of the tags exactly as they will render after saving:
 * a Google-style search snippet, a social share card and the raw tag list.
 * Values the admin has changed since the last save are highlighted, and blank
 * fields fall back to (and are labelled as) whatever the page generates itself.
 */
function SeoLivePreview({
  route,
  form,
  saved,
  defaults,
}: {
  route: string;
  form: OverrideForm;
  saved: OverrideForm;
  defaults: RouteTags | null;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const resolve = (k: keyof RouteTags) => {
    const own = (form[k as keyof OverrideForm] as string) ?? "";
    const wasOwn = (saved[k as keyof OverrideForm] as string) ?? "";
    const fallback = defaults?.[k] ?? "";
    return {
      value: own.trim() || fallback,
      source: own.trim() ? ("override" as const) : ("page" as const),
      changed: own.trim() !== wasOwn.trim(),
    };
  };

  const title = resolve("title");
  const description = resolve("description");
  const canonical = resolve("canonical");
  const ogTitle = { ...resolve("og_title") };
  if (!ogTitle.value) ogTitle.value = title.value;
  const ogDesc = { ...resolve("og_description") };
  if (!ogDesc.value) ogDesc.value = description.value;
  const ogImage = resolve("og_image");
  const card = resolve("twitter_card");
  const jsonLd = resolve("json_ld");

  let jsonState: "ok" | "invalid" | "empty" = "empty";
  if (jsonLd.value.trim()) {
    try {
      JSON.parse(jsonLd.value);
      jsonState = "ok";
    } catch {
      jsonState = "invalid";
    }
  }

  const url = canonical.value || origin + route;
  const chip = (c: boolean) =>
    c ? "ring-2 ring-accent/60 bg-accent/5 rounded-md px-1 -mx-1" : "";

  const rows: [string, { value: string; source: string; changed: boolean }][] = [
    ["title", title],
    ["meta description", description],
    ["canonical", { ...canonical, value: url }],
    ["og:title", ogTitle],
    ["og:description", ogDesc],
    ["og:image", ogImage],
    ["twitter:card", { ...card, value: card.value || "summary_large_image" }],
  ];

  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-4 space-y-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Live preview — highlighted parts are unsaved changes
      </p>

      {/* Google-style search snippet */}
      <div className="rounded-xl bg-background p-3">
        <p className="text-[10px] text-muted-foreground truncate">{url}</p>
        <p className={cn("text-sm text-[#1a0dab] leading-snug", chip(title.changed))}>
          {title.value || "No title — search engines will invent one"}
        </p>
        <p className={cn("text-xs text-muted-foreground mt-0.5", chip(description.changed))}>
          {description.value || "No description — Google will pull random page text."}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Title {title.value.length}/65 · Description {description.value.length}/160
          {form.no_index !== saved.no_index || form.no_index ? (
            <span className={cn("ml-2", chip(form.no_index !== saved.no_index))}>
              robots: {form.no_index ? "noindex,nofollow" : "index,follow"}
            </span>
          ) : null}
        </p>
      </div>

      {/* Social share card */}
      <div className="rounded-xl overflow-hidden bg-background max-w-sm">
        <div className={cn("aspect-[1.91/1] bg-secondary", chip(ogImage.changed))}>
          {ogImage.value ? (
            <img
              src={ogImage.value}
              alt="Social share preview"
              className="w-full h-full object-cover"
              onError={(e) => ((e.currentTarget.style.opacity = "0.2"), undefined)}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-[10px] text-muted-foreground">
              No social image — link will share without a picture
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {url.replace(/^https?:\/\//, "").split("/")[0]}
          </p>
          <p className={cn("text-sm font-medium", chip(ogTitle.changed))}>{ogTitle.value || "—"}</p>
          <p className={cn("text-xs text-muted-foreground", chip(ogDesc.changed))}>
            {ogDesc.value || "—"}
          </p>
        </div>
      </div>

      {/* Raw tags */}
      <div className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2 text-[11px]">
            <span className="w-28 shrink-0 text-muted-foreground">{k}</span>
            <span className={cn("min-w-0 break-all", chip(v.changed))}>
              {v.value || <span className="text-muted-foreground">—</span>}
              {v.source === "page" && v.value && (
                <span className="ml-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                  page default
                </span>
              )}
            </span>
          </div>
        ))}
        <div className="flex gap-2 text-[11px]">
          <span className="w-28 shrink-0 text-muted-foreground">JSON-LD</span>
          <span className={cn(chip(jsonLd.changed), jsonState === "invalid" && "text-destructive")}>
            {jsonState === "ok"
              ? "Valid structured data"
              : jsonState === "invalid"
                ? "Invalid JSON — fix before saving"
                : "Automatic structured data from the page"}
          </span>
        </div>
        {!defaults && (
          <p className="text-[10px] text-muted-foreground pt-1">Reading the page's own tags…</p>
        )}
      </div>
    </div>
  );
}

function FixEditor({ route, onClose }: { route: string; onClose: () => void }) {

  const [form, setForm] = useState<OverrideForm>(EMPTY);
  /** What is live right now (saved override) — used to highlight what changed. */
  const [saved, setSaved] = useState<OverrideForm>(EMPTY);
  /** What the page renders by itself when a field is left blank. */
  const [defaults, setDefaults] = useState<RouteTags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof OverrideForm, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    let alive = true;
    supabase
      .from("seo_overrides")
      .select("*")
      .eq("route", route)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        if (data) {
          const d = data as any;
          const next: OverrideForm = {
            title: d.title ?? "",
            description: d.description ?? "",
            canonical: d.canonical ?? "",
            og_title: d.og_title ?? "",
            og_description: d.og_description ?? "",
            og_image: d.og_image ?? "",
            twitter_card: d.twitter_card ?? "",
            json_ld: d.json_ld ? JSON.stringify(d.json_ld, null, 2) : "",
            no_index: !!d.no_index,
          };
          setForm(next);
          setSaved(next);
        }
        setLoading(false);
      });
    readRouteTags(route).then((t) => alive && setDefaults(t));
    return () => {
      alive = false;
    };
  }, [route]);



  async function save() {
    let json_ld: any = null;
    if (form.json_ld.trim()) {
      try {
        json_ld = JSON.parse(form.json_ld);
      } catch {
        toast.error("Structured data is not valid JSON");
        return;
      }
    }
    setSaving(true);
    const { error } = await supabase.from("seo_overrides").upsert(
      {
        route,
        title: form.title || null,
        description: form.description || null,
        canonical: form.canonical || null,
        og_title: form.og_title || null,
        og_description: form.og_description || null,
        og_image: form.og_image || null,
        twitter_card: form.twitter_card || null,
        json_ld,
        no_index: form.no_index,
      },
      { onConflict: "route" },
    );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    loadSeoOverrides(true);
    toast.success("Saved — re-checking this page…");
    await rescanRoute(route);
    onClose();
  }

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 size={13} className="animate-spin" /> Loading current tags…
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-background/60 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" hint="10–65 characters" value={form.title} onChange={(v) => set("title", v)} />
        <Field label="Canonical URL" value={form.canonical} onChange={(v) => set("canonical", v)} />
        <Field
          label="Description"
          hint="40–160 characters"
          textarea
          value={form.description}
          onChange={(v) => set("description", v)}
        />
        <Field
          label="Social description (og / twitter)"
          textarea
          value={form.og_description}
          onChange={(v) => set("og_description", v)}
        />
        <Field label="Social title" value={form.og_title} onChange={(v) => set("og_title", v)} />
        <Field label="Social image URL" value={form.og_image} onChange={(v) => set("og_image", v)} />
        <Field
          label="Twitter card"
          hint="summary_large_image or summary"
          value={form.twitter_card}
          onChange={(v) => set("twitter_card", v)}
        />
        <label className="flex items-end gap-2 pb-2 text-xs">
          <input
            type="checkbox"
            checked={form.no_index}
            onChange={(e) => set("no_index", e.target.checked)}
            className="accent-[hsl(var(--accent))]"
          />
          Hide this page from search engines
        </label>
      </div>
      <Field
        label="Structured data (JSON-LD)"
        hint="Leave blank to keep the automatic structured data"
        textarea
        value={form.json_ld}
        onChange={(v) => set("json_ld", v)}
      />
      <SeoLivePreview route={route} form={form} saved={saved} defaults={defaults} />
      <div className="flex items-center gap-2">

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-4 py-2 text-[10px] uppercase tracking-widest disabled:opacity-60"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save &amp; re-check
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-[10px] uppercase tracking-widest"
        >
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminSeo() {
  const scan = useSyncExternalStore(subscribeScan, getScanState, getScanState);
  const [editing, setEditing] = useState<string | null>(null);

  const { data: routes = [] } = useQuery({ queryKey: ["seo-routes"], queryFn: fetchSeoRoutes });

  const results = scan.results;
  const failed = useMemo(() => results.filter((r) => r.issues.length), [results]);
  const passed = results.length - failed.length;
  const total = scan.total || routes.length;
  const pct = total ? Math.round((results.length / total) * 100) : 0;

  function exportReport() {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `priora-seo-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl">SEO results</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Checks every public URL for title, description, canonical, Open Graph, Twitter and
            structured-data problems. The scan runs in the background — you can keep working.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {results.length > 0 && (
            <button
              onClick={exportReport}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-[10px] uppercase tracking-widest"
            >
              <Download size={13} /> Export
            </button>
          )}
          {scan.running ? (
            <button
              onClick={cancelScan}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-4 py-2 text-[10px] uppercase tracking-widest"
            >
              <X size={13} /> Stop
            </button>
          ) : (
            <button
              data-tour="seo-run"
              onClick={() => startScan()}
              disabled={routes.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-4 py-2 text-[10px] uppercase tracking-widest disabled:opacity-60"
            >
              <RefreshCw size={13} /> Scan {routes.length} URLs
            </button>
          )}
        </div>
      </div>

      {scan.running && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            Checking <span className="font-medium text-foreground">{scan.current}</span> —{" "}
            {results.length}/{total} done
          </p>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {results.length > 0 && !scan.running && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Passing</p>
            <p className="font-serif text-2xl text-foreground">{passed}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Needs work</p>
            <p className="font-serif text-2xl text-destructive">{failed.length}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {results.map((r) => (
          <div
            key={r.route}
            className={cn(
              "rounded-2xl border p-4",
              r.issues.length ? "border-destructive/40 bg-destructive/5" : "border-border bg-card",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium truncate">
                  {r.issues.length ? (
                    <AlertTriangle size={14} className="text-destructive shrink-0" />
                  ) : (
                    <CheckCircle2 size={14} className="text-accent shrink-0" />
                  )}
                  {r.route}
                </p>
                {r.title && <p className="text-[11px] text-muted-foreground truncate">{r.title}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={r.route}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-[10px] uppercase tracking-widest"
                >
                  <ExternalLink size={12} /> Open page
                </a>
                <button
                  onClick={() => setEditing(editing === r.route ? null : r.route)}
                  className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-3 py-1.5 text-[10px] uppercase tracking-widest"
                >
                  <Wand2 size={12} /> Fix tags
                </button>
                {r.issues.length > 0 && (
                  <Link
                    to={ADMIN_FOR(r.route)}
                    className="rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-[10px] uppercase tracking-widest"
                  >
                    Edit content
                  </Link>
                )}
              </div>
            </div>
            {r.issues.length > 0 && (
              <ul className="mt-2 space-y-1">
                {r.issues.map((i) => (
                  <li key={i} className="text-[11px] text-destructive">
                    · {i}
                  </li>
                ))}
              </ul>
            )}
            {editing === r.route && <FixEditor route={r.route} onClose={() => setEditing(null)} />}
          </div>
        ))}
      </div>

      {results.length === 0 && !scan.running && (
        <p className="text-xs text-muted-foreground">
          Run a scan to see which pages need attention. Nothing is changed on the live site — this
          only reads what search engines and social platforms see.
        </p>
      )}
    </div>
  );
}
