/**
 * Theme system: every color + text style on the storefront is admin-editable.
 * Values are stored as plain hex/strings in site_settings.theme (jsonb) and
 * applied to :root as CSS variables at runtime.
 */

export type TextRole = "heading" | "body" | "price" | "nav" | "badge" | "button";

export type TextStyle = {
  family: string;
  weight: string;
  /** empty string = inherit the built-in scale */
  size: string;
  lineHeight: string;
  letterSpacing: string;
  transform: "none" | "uppercase" | "capitalize" | "lowercase";
  color: string;
};

export type ThemeConfig = {
  colors: Record<string, string>;
  text: Record<TextRole, TextStyle>;
  /** per-word overrides for every fixed piece of copy on the storefront */
  slots: Record<string, Record<string, string | undefined>>;
};


export const FONT_OPTIONS = [
  { label: "Cormorant Garamond (serif)", value: "'Cormorant Garamond', serif" },
  { label: "Playfair Display (serif)", value: "'Playfair Display', serif" },
  { label: "Geist / System sans", value: "'Geist Sans', system-ui, sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, serif" },
  { label: "Courier (mono)", value: "'Courier New', monospace" },
];

export const COLOR_FIELDS: { key: string; label: string; hint: string }[] = [
  { key: "background", label: "Page background", hint: "Main site background" },
  { key: "foreground", label: "Main text", hint: "Default text colour" },
  { key: "card", label: "Card surface", hint: "Product cards, panels" },
  { key: "primary", label: "Primary pink", hint: "Soft pink surfaces" },
  { key: "accent", label: "Accent / buttons", hint: "Buttons and highlights" },
  { key: "accentForeground", label: "Accent text", hint: "Text on accent buttons" },
  { key: "muted", label: "Muted surface", hint: "Subtle backgrounds" },
  { key: "mutedForeground", label: "Muted text", hint: "Secondary text" },
  { key: "border", label: "Borders", hint: "Lines and dividers" },
  { key: "roseSoft", label: "Rose soft", hint: "Footer / menu tint" },
  { key: "rosePetal", label: "Rose petal", hint: "Gradients and marble" },
  { key: "gold", label: "Gold", hint: "Sparkles and accents" },
  { key: "wordmark", label: "PRIORA wordmark", hint: "Brand name colour" },
  { key: "wordmarkKp", label: "BY KP wordmark", hint: "Sub-brand colour" },
];

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    background: "#FFF4F8",
    foreground: "#3D2A25",
    card: "#FFEAF1",
    primary: "#F9C7D8",
    accent: "#E06A8B",
    accentForeground: "#FFFFFF",
    muted: "#FBE1EA",
    mutedForeground: "#8A6270",
    border: "#F5D3DF",
    roseSoft: "#FDE6EE",
    rosePetal: "#FAD1E0",
    gold: "#D9A441",
    wordmark: "#f06a69",
    wordmarkKp: "#C08A2E",
  },
  text: {
    heading: {
      family: "'Cormorant Garamond', serif",
      weight: "500",
      size: "",
      lineHeight: "",
      letterSpacing: "-0.02em",
      transform: "none",
      color: "#3D2A25",
    },
    body: {
      family: "'Geist Sans', system-ui, sans-serif",
      weight: "400",
      size: "",
      lineHeight: "",
      letterSpacing: "0em",
      transform: "none",
      color: "#3D2A25",
    },
    price: {
      family: "'Geist Sans', system-ui, sans-serif",
      weight: "600",
      size: "",
      lineHeight: "",
      letterSpacing: "0em",
      transform: "none",
      color: "#8D3B52",
    },
    nav: {
      family: "'Geist Sans', system-ui, sans-serif",
      weight: "500",
      size: "",
      lineHeight: "",
      letterSpacing: "0.18em",
      transform: "uppercase",
      color: "#5A4038",
    },
    badge: {
      family: "'Geist Sans', system-ui, sans-serif",
      weight: "600",
      size: "",
      lineHeight: "",
      letterSpacing: "0.12em",
      transform: "uppercase",
      color: "#FFFFFF",
    },
    button: {
      family: "'Geist Sans', system-ui, sans-serif",
      weight: "600",
      size: "",
      lineHeight: "",
      letterSpacing: "0.16em",
      transform: "uppercase",
      color: "#FFFFFF",
    },
  },
  slots: {},
};

export const TEXT_ROLE_LABELS: Record<TextRole, string> = {
  heading: "Headings (H1–H6)",
  body: "Body text & paragraphs",
  price: "Prices",
  nav: "Navigation & menu links",
  badge: "Badges & tags",
  button: "Buttons",
};

export function mergeTheme(raw: unknown): ThemeConfig {
  const t = (raw ?? {}) as Partial<ThemeConfig>;
  const text = {} as Record<TextRole, TextStyle>;
  (Object.keys(DEFAULT_THEME.text) as TextRole[]).forEach((role) => {
    text[role] = { ...DEFAULT_THEME.text[role], ...(t.text?.[role] ?? {}) };
  });
  return {
    colors: { ...DEFAULT_THEME.colors, ...(t.colors ?? {}) },
    text,
    slots: (t as any).slots ?? {},
  };
}

/** "#RRGGBB" -> "340 40% 96%" (the raw triple Tailwind tokens expect) */
export function hexToHslTriple(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return "0 0% 50%";
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const COLOR_VAR_MAP: Record<string, string[]> = {
  background: ["--background", "--popover"],
  foreground: ["--foreground", "--card-foreground", "--popover-foreground"],
  card: ["--card"],
  primary: ["--primary", "--secondary"],
  accent: ["--accent", "--ring"],
  accentForeground: ["--accent-foreground"],
  muted: ["--muted"],
  mutedForeground: ["--muted-foreground"],
  border: ["--border", "--input"],
  roseSoft: ["--rose-soft"],
  rosePetal: ["--rose-petal", "--rose-blush"],
  gold: ["--gold"],
};

export function applyTheme(theme: ThemeConfig, target: HTMLElement = document.documentElement) {
  Object.entries(theme.colors).forEach(([key, hex]) => {
    const triple = hexToHslTriple(hex);
    (COLOR_VAR_MAP[key] ?? []).forEach((v) => target.style.setProperty(v, triple));
  });
  target.style.setProperty("--brand-wordmark", theme.colors.wordmark);
  target.style.setProperty("--brand-wordmark-kp", theme.colors.wordmarkKp);

  (Object.keys(theme.text) as TextRole[]).forEach((role) => {
    const s = theme.text[role];
    target.style.setProperty(`--font-${role}`, s.family);
    target.style.setProperty(`--weight-${role}`, s.weight);
    if (s.size) target.style.setProperty(`--size-${role}`, s.size);
    else target.style.removeProperty(`--size-${role}`);
    if (s.lineHeight) target.style.setProperty(`--lh-${role}`, s.lineHeight);
    else target.style.removeProperty(`--lh-${role}`);
    target.style.setProperty(`--ls-${role}`, s.letterSpacing);
    target.style.setProperty(`--tt-${role}`, s.transform);
    target.style.setProperty(`--color-${role}`, s.color);
  });
}
