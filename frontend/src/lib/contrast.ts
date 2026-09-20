/** WCAG contrast helpers used by the admin accessibility checker. */

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex ?? "").trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function channel(c: number) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two hex colours (1 = identical, 21 = black on white). */
export function contrastRatio(fg: string, bg: string): number | null {
  const a = luminance(fg);
  const b = luminance(bg);
  if (a == null || b == null) return null;
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastVerdict = { ratio: number; level: "AAA" | "AA" | "AA Large" | "Fail"; ok: boolean };

/** `large` = 18px+ or bold 14px+ text, which has a lower WCAG threshold. */
export function judgeContrast(fg: string, bg: string, large = false): ContrastVerdict | null {
  const ratio = contrastRatio(fg, bg);
  if (ratio == null) return null;
  const rounded = Math.round(ratio * 100) / 100;
  if (ratio >= 7) return { ratio: rounded, level: "AAA", ok: true };
  if (ratio >= 4.5) return { ratio: rounded, level: "AA", ok: true };
  if (ratio >= 3 && large) return { ratio: rounded, level: "AA Large", ok: true };
  return { ratio: rounded, level: "Fail", ok: false };
}

/** Suggests black or white — whichever reads better on the given background. */
export function bestTextOn(bg: string) {
  const l = luminance(bg);
  if (l == null) return "#000000";
  return l > 0.45 ? "#231712" : "#FFFFFF";
}
