import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RotateCcw, Undo2, Eye, X, Download, Upload, AlertTriangle, Check } from "lucide-react";
import { useSiteSettings } from "@/lib/settings";
import {
  COLOR_FIELDS, DEFAULT_THEME, FONT_OPTIONS, TEXT_ROLE_LABELS,
  applyTheme, mergeTheme, type TextRole, type ThemeConfig,
} from "@/lib/theme";
import { SLOT_GROUPS } from "@/lib/textStyles";
import { TextStyleEditor } from "@/components/admin/TextStyleEditor";
import { judgeContrast, bestTextOn } from "@/lib/contrast";

const WEIGHTS = ["300", "400", "500", "600", "700"];
const TRANSFORMS = ["none", "uppercase", "capitalize", "lowercase"] as const;
const SPACINGS = ["-0.02em", "0em", "0.05em", "0.12em", "0.18em", "0.28em"];
const SIZES = ["", "0.65rem", "0.75rem", "0.875rem", "1rem", "1.125rem", "1.25rem", "1.5rem", "2rem", "2.5rem", "3rem"];
const LINE_HEIGHTS = ["", "1", "1.15", "1.3", "1.5", "1.6", "1.8", "2"];

/** Which background each text role usually sits on. */
const ROLE_BG: Record<string, string> = {
  heading: "background",
  body: "background",
  price: "card",
  nav: "background",
  badge: "accent",
  button: "accent",
};

export default function AdminTheme() {
  const qc = useQueryClient();
  const { data } = useSiteSettings();
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [history, setHistory] = useState<ThemeConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (data && !loaded.current) {
      loaded.current = true;
      setTheme(mergeTheme((data as any).theme));
    }
  }, [data]);

  // live preview inside the admin tab only
  useEffect(() => { applyTheme(theme); }, [theme]);

  // keep the preview iframe in sync
  useEffect(() => {
    try { localStorage.setItem("priora-theme-preview", JSON.stringify(theme)); } catch { /* ignore */ }
  }, [theme]);

  /** every edit goes through here so Undo can step back one change at a time */
  function edit(fn: (t: ThemeConfig) => ThemeConfig) {
    setTheme((t) => {
      setHistory((h) => [...h.slice(-49), t]);
      return fn(t);
    });
  }
  function undo() {
    setHistory((h) => {
      if (!h.length) return h;
      setTheme(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }

  async function save(next: ThemeConfig = theme) {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({ theme: next as any }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Published — live on the storefront");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  }

  const setColor = (key: string, value: string) => edit((t) => ({ ...t, colors: { ...t.colors, [key]: value } }));
  const setText = (role: TextRole, patch: Partial<ThemeConfig["text"][TextRole]>) =>
    edit((t) => ({ ...t, text: { ...t.text, [role]: { ...t.text[role], ...patch } } }));

  function exportTheme() {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `priora-theme-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Theme preset downloaded");
  }

  async function importTheme(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      edit(() => mergeTheme(parsed));
      toast.success("Preset loaded — review it, then Publish");
    } catch {
      toast.error("That file isn't a valid theme preset");
    }
  }

  const contrastIssues = (Object.keys(theme.text) as TextRole[])
    .map((role) => {
      const bgKey = ROLE_BG[role] ?? "background";
      const bg = theme.colors[bgKey] ?? "#ffffff";
      const v = judgeContrast(theme.text[role].color, bg, role === "heading");
      return v ? { role, bg, bgKey, ...v } : null;
    })
    .filter(Boolean) as { role: TextRole; bg: string; bgKey: string; ratio: number; level: string; ok: boolean }[];
  const failing = contrastIssues.filter((c) => !c.ok);

  const sel = "w-full bg-secondary/60 rounded-xl px-3 py-2 text-sm outline-none";
  const label = "text-[10px] uppercase tracking-widest text-muted-foreground";

  return (
    <div className="max-w-3xl pb-8">
      <h1 className="font-serif text-3xl mb-1">Colours, Fonts &amp; Wording</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Nothing here is live until you press Publish. Use Preview to check it first.
      </p>

      <section className="mb-10" data-tour="theme-colors">
        <h2 className="font-serif text-xl mb-3">Colours</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COLOR_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3 bg-card/60 border border-border rounded-2xl p-3">
              <input
                type="color"
                aria-label={f.label}
                value={theme.colors[f.key] ?? "#ffffff"}
                onChange={(e) => setColor(f.key, e.target.value)}
                className="h-10 w-10 rounded-xl border border-border bg-transparent cursor-pointer shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{f.label}</p>
                <p className="text-[11px] text-muted-foreground truncate">{f.hint}</p>
              </div>
              <input
                value={theme.colors[f.key] ?? ""}
                onChange={(e) => setColor(f.key, e.target.value)}
                className="w-[86px] bg-secondary/60 rounded-lg px-2 py-1.5 text-[11px] outline-none"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10" data-tour="theme-roles">
        <h2 className="font-serif text-xl mb-1">Text roles</h2>
        <p className="text-xs text-muted-foreground mb-3">Site-wide defaults for each kind of text.</p>
        <div className="space-y-3">
          {(Object.keys(theme.text) as TextRole[]).map((role) => {
            const s = theme.text[role];
            return (
              <div key={role} className="bg-card/60 border border-border rounded-2xl p-4">
                <p className="text-sm mb-3">{TEXT_ROLE_LABELS[role]}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-2 md:col-span-3">
                    <label className={label}>Font</label>
                    <select className={sel} value={s.family} onChange={(e) => setText(role, { family: e.target.value })}>
                      {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Weight</label>
                    <select className={sel} value={s.weight} onChange={(e) => setText(role, { weight: e.target.value })}>
                      {WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Font size</label>
                    <select className={sel} value={s.size ?? ""} onChange={(e) => setText(role, { size: e.target.value })}>
                      {SIZES.map((x) => <option key={x} value={x}>{x || "Default scale"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Line height</label>
                    <select className={sel} value={s.lineHeight ?? ""} onChange={(e) => setText(role, { lineHeight: e.target.value })}>
                      {LINE_HEIGHTS.map((x) => <option key={x} value={x}>{x || "Default"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Letter spacing</label>
                    <select className={sel} value={s.letterSpacing} onChange={(e) => setText(role, { letterSpacing: e.target.value })}>
                      {SPACINGS.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Casing</label>
                    <select className={sel} value={s.transform} onChange={(e) => setText(role, { transform: e.target.value as any })}>
                      {TRANSFORMS.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-3 flex items-center gap-3">
                    <input
                      type="color" aria-label={`${role} colour`} value={s.color}
                      onChange={(e) => setText(role, { color: e.target.value })}
                      className="h-9 w-9 rounded-lg border border-border bg-transparent cursor-pointer"
                    />
                    <input
                      value={s.color} onChange={(e) => setText(role, { color: e.target.value })}
                      className="w-[100px] bg-secondary/60 rounded-lg px-2 py-1.5 text-[11px] outline-none"
                    />
                    <span
                      className="ml-auto truncate text-right"
                      style={{
                        fontFamily: s.family, fontWeight: s.weight as any,
                        letterSpacing: s.letterSpacing, textTransform: s.transform, color: s.color,
                      }}
                    >
                      Jewellery that reflects your Aura
                    </span>
                    {(() => {
                      const bg = theme.colors[ROLE_BG[role] ?? "background"] ?? "#ffffff";
                      const v = judgeContrast(s.color, bg, role === "heading");
                      if (!v) return null;
                      return (
                        <span
                          className={`shrink-0 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase tracking-widest ${v.ok ? "bg-emerald-500/15 text-emerald-700" : "bg-destructive/15 text-destructive"}`}
                          title={`Contrast ${v.ratio}:1 against ${ROLE_BG[role]}`}
                        >
                          {v.ok ? <Check size={11} /> : <AlertTriangle size={11} />} {v.ratio}:1
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-10" data-tour="theme-contrast">
        <h2 className="font-serif text-xl mb-1">Accessibility check</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Live WCAG contrast of each text colour against the surface it sits on. Aim for 4.5:1 or better.
        </p>
        <div className="space-y-2">
          {contrastIssues.map((c) => (
            <div key={c.role} className="flex items-center gap-3 bg-card/60 border border-border rounded-2xl p-3">
              <span
                className="h-9 w-9 rounded-xl border border-border shrink-0 grid place-items-center text-[11px]"
                style={{ background: c.bg, color: theme.text[c.role].color }}
              >
                Aa
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{TEXT_ROLE_LABELS[c.role]}</p>
                <p className="text-[11px] text-muted-foreground">on {c.bgKey} · {c.ratio}:1 · {c.level}</p>
              </div>
              {!c.ok && (
                <button
                  onClick={() => setText(c.role, { color: bestTextOn(c.bg) })}
                  className="text-[10px] uppercase tracking-widest bg-accent text-accent-foreground px-3 py-1.5 rounded-full"
                >
                  Fix
                </button>
              )}
            </div>
          ))}
          {!failing.length && (
            <p className="text-xs text-emerald-700 flex items-center gap-1"><Check size={13} /> All text passes AA contrast.</p>
          )}
        </div>
      </section>

      <section className="mb-10" data-tour="theme-slots">
        <h2 className="font-serif text-xl mb-1">Every word on the site</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Section headings, buttons, popup copy and footer links. Text belonging to a product, category,
          banner, review, film or page is edited on that item's own page instead.
        </p>
        <div className="space-y-3">
          {SLOT_GROUPS.map((g) => (
            <TextStyleEditor
              key={g.group}
              title={g.group}
              hint={g.hint}
              allowText
              fields={g.slots.map((s) => ({ key: s.key, label: s.label, defaultText: s.defaultText }))}
              value={theme.slots as any}
              onChange={(next) => edit((t) => ({ ...t, slots: next as any }))}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2 sticky bottom-4 bg-background/90 backdrop-blur-md border border-border rounded-full p-2">
        <button data-tour="theme-save" onClick={() => save()} disabled={saving} className="bg-accent text-accent-foreground px-6 py-3 rounded-full text-xs uppercase tracking-widest disabled:opacity-60">
          {saving ? "Publishing…" : "Publish"}
        </button>
        <button data-tour="theme-preview" onClick={() => setPreview(true)} className="flex items-center gap-2 border border-border px-5 py-3 rounded-full text-xs uppercase tracking-widest">
          <Eye size={13} /> Preview Changes
        </button>
        <button data-tour="theme-undo" onClick={undo} disabled={!history.length} className="flex items-center gap-2 border border-border px-5 py-3 rounded-full text-xs uppercase tracking-widest disabled:opacity-40">
          <Undo2 size={13} /> Undo
        </button>
        <button
          onClick={() => edit(() => DEFAULT_THEME)}
          className="flex items-center gap-2 border border-border px-5 py-3 rounded-full text-xs uppercase tracking-widest"
        >
          <RotateCcw size={13} /> Reset to default
        </button>
        <button onClick={exportTheme} className="flex items-center gap-2 border border-border px-5 py-3 rounded-full text-xs uppercase tracking-widest">
          <Download size={13} /> Export
        </button>
        <label className="flex items-center gap-2 border border-border px-5 py-3 rounded-full text-xs uppercase tracking-widest cursor-pointer">
          <Upload size={13} /> Import
          <input
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) importTheme(f); e.target.value = ""; }}
          />
        </label>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[120] bg-foreground/60 backdrop-blur-sm p-3 md:p-6 flex flex-col" onClick={() => setPreview(false)}>
          <div className="mx-auto w-full max-w-5xl flex-1 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between text-background mb-2">
              <p className="text-xs uppercase tracking-widest">Preview Changes — not published yet</p>
              <button onClick={() => setPreview(false)} aria-label="Close preview" className="p-1"><X size={18} /></button>
            </div>
            <iframe
              key={JSON.stringify(theme).length}
              title="Storefront preview"
              src="/?preview=1"
              className="flex-1 w-full rounded-3xl bg-background border border-border"
            />
          </div>
        </div>
      )}
    </div>
  );
}
