import { createElement, type ElementType, type ReactNode } from "react";
import { useSiteSettings } from "@/lib/settings";
import { slotDefault, styleToCss, type PartialTextStyle, type StyleMap } from "@/lib/textStyles";

/** Live slot styles from the admin theme (also honours the preview overlay). */
export function useSlots(): StyleMap {
  const { data } = useSiteSettings();
  const saved = ((data as any)?.theme?.slots ?? {}) as StyleMap;
  const preview = readPreviewSlots();
  return preview ? { ...saved, ...preview } : saved;
}

function readPreviewSlots(): StyleMap | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  if (!p.has("preview") && !p.has("__preview")) return null;
  try {
    const raw = window.localStorage.getItem("priora-theme-preview");
    return raw ? ((JSON.parse(raw)?.slots ?? {}) as StyleMap) : null;
  } catch {
    return null;
  }
}

export function useSlot(key: string) {
  const slots = useSlots();
  const s = slots[key] as PartialTextStyle | undefined;
  return {
    style: styleToCss(s),
    text: (s?.text && s.text.trim()) || slotDefault(key),
  };
}

/**
 * Renders one piece of admin-editable copy.
 * `<T k="home.bestsellers.title" as="h2" className="..." />`
 */
export function T({
  k,
  as = "span",
  className,
  children,
  style,
}: {
  k: string;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}) {
  const s = useSlot(k);
  return createElement(as, { className, style: { ...s.style, ...style } }, children ?? s.text);
}

/** For places that need the plain string (placeholders, aria labels). */
export function useSlotText(key: string) {
  return useSlot(key).text;
}
