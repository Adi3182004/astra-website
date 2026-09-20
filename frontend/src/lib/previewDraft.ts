/**
 * Live "unsaved changes" preview bridge.
 *
 * An admin form publishes whatever is currently typed into it (a *draft*).
 * The storefront, when it is loaded inside the admin preview iframe
 * (`?__preview=1`), merges that draft over the data it fetched from the
 * database — so the preview shows the change *before* it is saved, and the
 * real website stays untouched until the admin hits Save.
 *
 * Transport is `localStorage` (same-origin, so the iframe can read it) plus a
 * `BroadcastChannel` for instant, keystroke-level updates.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type PreviewDraft = {
  /** database table the draft belongs to, e.g. "banners" */
  table: string;
  /** existing record id, or null for a brand-new unsaved record */
  id: string | null;
  values: Record<string, any>;
} | null;

const KEY = "priora:preview-draft";
const CHANNEL = "priora-preview-draft";

/** Fake id used for a record that doesn't exist in the database yet. */
export const DRAFT_ID = "__draft";

function channel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL);
}

export function readDraft(): PreviewDraft {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PreviewDraft) : null;
  } catch {
    return null;
  }
}

/** Called by admin forms on every change while a preview may be open. */
export function publishDraft(draft: PreviewDraft) {
  if (typeof window === "undefined") return;
  try {
    if (draft) localStorage.setItem(KEY, JSON.stringify(draft));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage full / disabled — the BroadcastChannel below still works */
  }
  const ch = channel();
  ch?.postMessage(draft);
  ch?.close();
}

export function clearDraft() {
  publishDraft(null);
}

/** True when this document is the storefront rendered inside a preview frame. */
export function inPreview() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("__preview") === "1";
}

/**
 * Returns a merge function for one table. Outside a preview frame it is the
 * identity function, so the live storefront pays nothing for this feature.
 */
export function usePreviewDraft(table: string) {
  const active = useRef(inPreview()).current;
  const [draft, setDraft] = useState<PreviewDraft>(active ? readDraft() : null);

  useEffect(() => {
    if (!active) return;
    const ch = channel();
    const onMessage = (e: MessageEvent) => setDraft(e.data ?? null);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setDraft(readDraft());
    };
    ch?.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      ch?.removeEventListener("message", onMessage);
      ch?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [active]);

  return useCallback(
    <T extends { id: string; is_active?: boolean }>(rows: T[] | undefined | null): T[] => {
      const list = rows ?? [];
      if (!active || !draft || draft.table !== table) return list;

      if (draft.id) {
        let found = false;
        const merged = list.map((r) => {
          if (r.id !== draft.id) return r;
          found = true;
          return { ...r, ...draft.values, id: r.id } as T;
        });
        const out = found
          ? merged
          : ([{ ...(draft.values as any), id: draft.id }, ...merged] as T[]);
        return out.filter((r) => r.is_active !== false);
      }

      return [{ ...(draft.values as any), id: DRAFT_ID } as T, ...list].filter(
        (r) => r.is_active !== false,
      );
    },
    [active, draft, table],
  );
}

const DRAFT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80";

/**
 * Product drafts arrive in raw table shape (with a `product_images` array),
 * while the storefront grid expects the flattened card shape. This converts
 * only the draft rows and leaves saved rows untouched.
 */
export function normalizeProductDrafts<T extends Record<string, any>>(rows: T[]): T[] {
  return rows.map((p) => {
    if (!p.product_images) return p;
    const imgs = [...p.product_images].sort((a: any, b: any) => a.sort_order - b.sort_order);
    const textStyle = p.text_style || {};
    const hoverEnabled = !!textStyle.enable_hover_image;
    const explicitHoverUrl = textStyle.hover_image_url || null;
    return {
      ...p,
      price: Number(p.price) || 0,
      compare_at_price: p.compare_at_price != null ? Number(p.compare_at_price) : null,
      image: imgs[0]?.url ?? p.image ?? DRAFT_FALLBACK_IMAGE,
      hoverImage: hoverEnabled && explicitHoverUrl ? explicitHoverUrl : (imgs[1]?.url ?? p.hoverImage ?? null),
      stock: Number(p.stock) || 0,
      show_stock: p.show_stock !== undefined ? p.show_stock : true,
      stock_prefix: p.stock_prefix ?? null,
      stock_suffix: p.stock_suffix ?? null,
      out_of_stock: !!p.out_of_stock,
      text_style: textStyle,
    } as unknown as T;
  });
}
