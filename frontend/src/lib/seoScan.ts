/**
 * Background SEO crawler.
 *
 * The scan lives OUTSIDE React: it owns its own hidden iframe appended to
 * <body>, keeps its state in a module-level store, and notifies subscribers as
 * each URL finishes. The admin can navigate away, come back, or keep working
 * while it runs — the dashboard never blocks page rendering, it just renders
 * whatever the store currently holds.
 */
import { supabase } from "@/integrations/supabase/client";

export type SeoResult = { route: string; issues: string[]; title?: string };

export type ScanState = {
  running: boolean;
  results: SeoResult[];
  current: string | null;
  total: number;
  finishedAt: number | null;
};

const MIN_TITLE = 10;
const MAX_TITLE = 65;
const MIN_DESC = 40;
const MAX_DESC = 160;

let state: ScanState = { running: false, results: [], current: null, total: 0, finishedAt: null };
const listeners = new Set<(s: ScanState) => void>();
let cancelled = false;

function set(patch: Partial<ScanState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
}

export function getScanState() {
  return state;
}

export function subscribeScan(fn: (s: ScanState) => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

export function cancelScan() {
  cancelled = true;
  set({ running: false, current: null });
}

export async function fetchSeoRoutes() {
  const [p, c, i] = await Promise.all([
    supabase.from("products").select("slug").eq("is_active", true),
    supabase.from("categories").select("slug").eq("is_active", true),
    supabase.from("info_pages").select("slug").eq("is_active", true),
  ]);
  return [
    "/",
    "/shop",
    "/wishlist",
    ...(c.data ?? []).map((r: any) => `/category/${r.slug}`),
    ...(p.data ?? []).map((r: any) => `/product/${r.slug}`),
    ...(i.data ?? []).map((r: any) => `/page/${r.slug}`),
  ];
}

export function auditDocument(doc: Document, route: string) {
  const issues: string[] = [];
  const attr = (sel: string, a = "content") => doc.head.querySelector(sel)?.getAttribute(a) ?? null;

  const title = doc.title;
  const description = attr('meta[name="description"]');
  const canonical = attr('link[rel="canonical"]', "href");
  const checks: Record<string, string | null> = {
    "og:title": attr('meta[property="og:title"]'),
    "og:description": attr('meta[property="og:description"]'),
    "og:type": attr('meta[property="og:type"]'),
    "og:url": attr('meta[property="og:url"]'),
    "twitter:card": attr('meta[name="twitter:card"]'),
    "twitter:title": attr('meta[name="twitter:title"]'),
  };

  if (!title || title.length < MIN_TITLE) issues.push("Title missing or too short");
  else if (title.length > MAX_TITLE) issues.push(`Title too long (${title.length}/${MAX_TITLE})`);
  if (!description || description.length < MIN_DESC) issues.push("Description missing or thin");
  else if (description.length > MAX_DESC) issues.push(`Description over ${MAX_DESC} chars`);
  if (!canonical) issues.push("Canonical link missing");
  else if (!canonical.includes(route === "/" ? "/" : route))
    issues.push("Canonical does not point at this page");

  for (const [k, v] of Object.entries(checks)) if (!v) issues.push(`${k} missing`);

  const h1 = doc.querySelectorAll("h1").length;
  if (h1 !== 1) issues.push(`Expected exactly one H1, found ${h1}`);

  if (route.startsWith("/product/")) {
    if (!attr('meta[property="og:image"]')) issues.push("og:image missing");
    const blocks = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => {
        try {
          return JSON.parse(s.textContent ?? "");
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const product = blocks.find((b: any) => b?.["@type"] === "Product");
    if (!product) issues.push("Product structured data (JSON-LD) missing or invalid");
    else {
      if (!product.name) issues.push("JSON-LD: product name missing");
      if (product.offers?.price === undefined) issues.push("JSON-LD: price missing");
      if (!product.offers?.availability) issues.push("JSON-LD: availability missing");
    }
  }

  return { issues, title };
}

function crawlerFrame() {
  let el = document.getElementById("seo-crawler-frame") as HTMLIFrameElement | null;
  if (!el) {
    el = document.createElement("iframe");
    el.id = "seo-crawler-frame";
    el.title = "SEO crawler";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px";
    document.body.appendChild(el);
  }
  return el;
}

function loadRoute(route: string) {
  return new Promise<Document | null>((resolve) => {
    const el = crawlerFrame();
    const timer = setTimeout(() => resolve(el.contentDocument ?? null), 8000);
    el.onload = () => {
      // Let the router paint its head tags before reading them.
      setTimeout(() => {
        clearTimeout(timer);
        resolve(el.contentDocument ?? null);
      }, 700);
    };
    el.src = `${route}${route.includes("?") ? "&" : "?"}__seo=1`;
  });
}

/** Re-checks a single route and merges the result into the store. */
export async function rescanRoute(route: string) {
  const doc = await loadRoute(route);
  const result: SeoResult = doc
    ? { route, ...auditDocument(doc, route) }
    : { route, issues: ["Page could not be loaded"] };
  set({
    results: state.results.some((r) => r.route === route)
      ? state.results.map((r) => (r.route === route ? result : r))
      : [...state.results, result],
  });
  return result;
}

export async function startScan() {
  if (state.running) return;
  cancelled = false;
  const routes = await fetchSeoRoutes();
  set({ running: true, results: [], current: null, total: routes.length, finishedAt: null });

  for (const route of routes) {
    if (cancelled) break;
    set({ current: route });
    try {
      const doc = await loadRoute(route);
      const result: SeoResult = doc
        ? { route, ...auditDocument(doc, route) }
        : { route, issues: ["Page could not be loaded"] };
      set({ results: [...state.results, result] });
    } catch (e: any) {
      set({
        results: [...state.results, { route, issues: [`Could not load page: ${e?.message ?? e}`] }],
      });
    }
    // Yield to the browser so the admin UI stays perfectly responsive.
    await new Promise((r) => setTimeout(r, 0));
  }

  set({ running: false, current: null, finishedAt: Date.now() });
}

/**
 * Reads the tags a route renders on its own (before any admin override is
 * applied on top). Used by the "Fix tags" live preview so the admin can see
 * exactly what a blank field will fall back to.
 */
export type RouteTags = {
  title: string;
  description: string;
  canonical: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: string;
  json_ld: string;
};

export async function readRouteTags(route: string): Promise<RouteTags> {
  const doc = await loadRoute(route);
  const attr = (sel: string, a = "content") =>
    doc?.head.querySelector(sel)?.getAttribute(a) ?? "";
  const ld = doc
    ? Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => s.textContent ?? "")
        .filter(Boolean)[0] ?? ""
    : "";
  return {
    title: doc?.title ?? "",
    description: attr('meta[name="description"]'),
    canonical: attr('link[rel="canonical"]', "href"),
    og_title: attr('meta[property="og:title"]'),
    og_description: attr('meta[property="og:description"]'),
    og_image: attr('meta[property="og:image"]'),
    twitter_card: attr('meta[name="twitter:card"]'),
    json_ld: ld,
  };
}
