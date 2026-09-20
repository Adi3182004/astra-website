import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Smartphone, Monitor, RefreshCw } from "lucide-react";
import { PREVIEW_TARGETS, previewUrl, type PreviewKey } from "@/lib/preview";
import { publishDraft, clearDraft, DRAFT_ID } from "@/lib/previewDraft";
import { cn } from "@/lib/utils";

/**
 * Opens a live storefront preview focused on exactly the section this admin
 * page controls. Everything above and below the section is blurred, so the
 * admin sees their change in place before publishing it.
 *
 * When `draft` is supplied, the *unsaved* form values are streamed into the
 * preview frame, so the admin sees the change before pressing Save — the live
 * website is untouched until then.
 */
export function PreviewButton({
  target,
  itemId,
  path,
  label,
  className,
  draft,
}: {
  target: PreviewKey;
  itemId?: string;
  path?: string;
  label?: string;
  className?: string;
  /** Unsaved form values to preview: which table they belong to and the row id (null = new record). */
  draft?: { table: string; id: string | null; values: Record<string, any> };
}) {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [nonce, setNonce] = useState(0);
  const t = PREVIEW_TARGETS[target];
  const focusId = draft ? draft.id ?? DRAFT_ID : itemId;
  const src = `${previewUrl(target, { itemId: focusId, path })}&_=${nonce}`;

  // Stream every keystroke of the unsaved form into the open preview frame.
  useEffect(() => {
    if (!open || !draft) return;
    publishDraft(draft);
  }, [open, draft?.table, draft?.id, JSON.stringify(draft?.values)]);

  useEffect(() => {
    if (!open) clearDraft();
  }, [open]);

  useEffect(() => () => clearDraft(), []);

  return (
    <>
      <button
        onClick={() => {
          if (draft) publishDraft(draft);
          setNonce((n) => n + 1);
          setOpen(true);
        }}
        data-tour="preview-button"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-secondary transition",
          className,
        )}
      >
        <Eye size={13} /> {label ?? (draft ? "Preview Changes" : "Full Preview")}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[190] bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-3">
            <div className="w-full max-w-5xl h-[92vh] rounded-3xl bg-card border border-border overflow-hidden flex flex-col luxury-shadow">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {draft ? "Preview Changes · unsaved changes" : "Full Preview"}
                  </p>
                  <p className="font-serif text-lg">{label ?? t.label}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setDevice("mobile")} aria-label="Mobile preview"
                    className={cn("p-2 rounded-full", device === "mobile" ? "bg-accent text-accent-foreground" : "bg-secondary")}>
                    <Smartphone size={14} />
                  </button>
                  <button onClick={() => setDevice("desktop")} aria-label="Desktop preview"
                    className={cn("p-2 rounded-full", device === "desktop" ? "bg-accent text-accent-foreground" : "bg-secondary")}>
                    <Monitor size={14} />
                  </button>
                  <button onClick={() => setNonce((n) => n + 1)} aria-label="Reload preview" className="p-2 rounded-full bg-secondary">
                    <RefreshCw size={14} />
                  </button>
                  <button onClick={() => setOpen(false)} aria-label="Close preview" className="p-2 rounded-full bg-secondary">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-rose-soft/30 flex justify-center p-3">
                <iframe
                  key={src + device}
                  title="Storefront preview"
                  src={src}
                  loading="lazy"
                  className={cn(
                    "h-full bg-background rounded-2xl border border-border/60 shadow-inner",
                    device === "mobile" ? "w-[390px] max-w-full" : "w-full",
                  )}
                />
              </div>
              <p className="px-4 py-2 text-[11px] text-muted-foreground border-t border-border">
                {draft
                  ? "Showing your unsaved edits exactly as they'll look — nothing is live until you press Save."
                  : "Full preview of the storefront section."}
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
