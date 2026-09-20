import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { FONT_OPTIONS } from "@/lib/theme";
import type { PartialTextStyle, StyleMap } from "@/lib/textStyles";
import { cn } from "@/lib/utils";

const WEIGHTS = ["", "300", "400", "500", "600", "700"];
const SIZES = ["", "0.65rem", "0.75rem", "0.875rem", "1rem", "1.25rem", "1.5rem", "2rem", "2.5rem", "3rem"];
const SPACINGS = ["", "-0.02em", "0em", "0.05em", "0.12em", "0.18em", "0.28em"];
const TRANSFORMS = ["", "none", "uppercase", "capitalize", "lowercase"];
const LINE_HEIGHTS = ["", "1", "1.15", "1.3", "1.5", "1.6", "1.8", "2"];

const sel = "w-full bg-secondary/60 rounded-xl px-2.5 py-2 text-xs outline-none";
const lbl = "text-[10px] uppercase tracking-widest text-muted-foreground";

/**
 * Reusable "style this exact piece of text" editor.
 * Used by the Theme page (site-wide slots) and inside every admin form
 * (per banner / category / product / review styling).
 */
export function TextStyleEditor({
  fields,
  value,
  onChange,
  allowText = false,
  title = "Text styling",
  hint,
  defaultOpen = false,
}: {
  fields: { key: string; label: string; defaultText?: string }[];
  value: StyleMap;
  onChange: (next: StyleMap) => void;
  allowText?: boolean;
  title?: string;
  hint?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  function patch(key: string, p: Partial<PartialTextStyle>) {
    onChange({ ...value, [key]: { ...(value[key] ?? {}), ...p } });
  }
  function reset(key: string) {
    const next = { ...value };
    delete next[key];
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-border bg-card/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span>
          <span className="text-sm">{title}</span>
          {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
        </span>
        <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {fields.map((f) => {
            const s = value[f.key] ?? {};
            return (
              <div key={f.key} className="rounded-xl bg-secondary/40 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs">{f.label}</p>
                  <button type="button" onClick={() => reset(f.key)} className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <RotateCcw size={11} /> Default
                  </button>
                </div>

                {allowText && (
                  <div className="mb-2">
                    <label className={lbl}>Wording</label>
                    <input
                      className={sel}
                      placeholder={f.defaultText ?? ""}
                      value={s.text ?? ""}
                      onChange={(e) => patch(f.key, { text: e.target.value })}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="col-span-2 md:col-span-3">
                    <label className={lbl}>Font</label>
                    <select className={sel} value={s.family ?? ""} onChange={(e) => patch(f.key, { family: e.target.value })}>
                      <option value="">Inherit from theme</option>
                      {FONT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Weight</label>
                    <select className={sel} value={s.weight ?? ""} onChange={(e) => patch(f.key, { weight: e.target.value })}>
                      {WEIGHTS.map((w) => <option key={w} value={w}>{w || "Inherit"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Size</label>
                    <select className={sel} value={s.size ?? ""} onChange={(e) => patch(f.key, { size: e.target.value })}>
                      {SIZES.map((w) => <option key={w} value={w}>{w || "Inherit"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Line height</label>
                    <select className={sel} value={s.lineHeight ?? ""} onChange={(e) => patch(f.key, { lineHeight: e.target.value })}>
                      {LINE_HEIGHTS.map((w) => <option key={w} value={w}>{w || "Inherit"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Spacing</label>
                    <select className={sel} value={s.letterSpacing ?? ""} onChange={(e) => patch(f.key, { letterSpacing: e.target.value })}>
                      {SPACINGS.map((w) => <option key={w} value={w}>{w || "Inherit"}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Casing</label>
                    <select className={sel} value={s.transform ?? ""} onChange={(e) => patch(f.key, { transform: e.target.value as any })}>
                      {TRANSFORMS.map((w) => <option key={w} value={w}>{w || "Inherit"}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className={lbl}>Text Colour</label>
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="color"
                          aria-label={`${f.label} text colour`}
                          value={s.color || "#181113"}
                          onChange={(e) => patch(f.key, { color: e.target.value })}
                          className="h-8 w-9 rounded-lg border border-border bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          className={sel}
                          placeholder="Inherit (e.g. #181113)"
                          value={s.color ?? ""}
                          onChange={(e) => patch(f.key, { color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Background Colour</label>
                      <div className="flex items-center gap-2 mt-0.5">
                        <input
                          type="color"
                          aria-label={`${f.label} background colour`}
                          value={s.backgroundColor || "#ffffff"}
                          onChange={(e) => patch(f.key, { backgroundColor: e.target.value })}
                          className="h-8 w-9 rounded-lg border border-border bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          className={sel}
                          placeholder="Transparent / Inherit"
                          value={s.backgroundColor ?? ""}
                          onChange={(e) => patch(f.key, { backgroundColor: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-2.5 p-2 rounded-lg border border-border/40 overflow-hidden"
                  style={{
                    backgroundColor: s.backgroundColor || "transparent",
                  }}
                >
                  <p
                    className="truncate"
                    style={{
                      fontFamily: s.family, fontWeight: s.weight as any, fontSize: s.size,
                      lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textTransform: s.transform as any,
                      color: s.color,
                    }}
                  >
                    {s.text || f.defaultText || f.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
