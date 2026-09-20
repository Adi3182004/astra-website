/**
 * Automated SEO checker.
 *
 * Loads every public product, category and info page from the database, opens
 * each URL in a real browser (so client-rendered head tags are included) and
 * validates title, description, canonical, Open Graph / Twitter tags and
 * JSON-LD. Missing or weak fields are reported per URL instead of throwing, so
 * one bad page never hides the rest.
 *
 *   node scripts/seo-check.mjs [--base http://localhost:8080]
 */
import { existsSync, readdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

// Read the project env file without pulling in an extra dependency.
try {
  const envPath = existsSync("backend/.env") ? "backend/.env" : ".env";
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
} catch {
  /* env file optional when the vars are already exported */
}

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const BASE = arg("base", process.env.E2E_BASE_URL ?? "http://localhost:8080");
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing backend environment variables — run this from the project root.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function collectRoutes() {
  const [{ data: products }, { data: categories }, { data: pages }] = await Promise.all([
    supabase.from("products").select("slug").eq("is_active", true),
    supabase.from("categories").select("slug").eq("is_active", true),
    supabase.from("info_pages").select("slug").eq("is_active", true),
  ]);
  return [
    "/",
    "/shop",
    "/wishlist",
    ...(categories ?? []).map((c) => `/category/${c.slug}`),
    ...(products ?? []).map((p) => `/product/${p.slug}`),
    ...(pages ?? []).map((p) => `/page/${p.slug}`),
  ];
}

async function audit(page, route) {
  const issues = [];
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(150);

  const head = await page.evaluate(() => {
    const attr = (sel, a = "content") => document.head.querySelector(sel)?.getAttribute(a) ?? null;
    return {
      title: document.title,
      description: attr('meta[name="description"]'),
      canonical: attr('link[rel="canonical"]', "href"),
      ogTitle: attr('meta[property="og:title"]'),
      ogDescription: attr('meta[property="og:description"]'),
      ogType: attr('meta[property="og:type"]'),
      ogUrl: attr('meta[property="og:url"]'),
      ogImage: attr('meta[property="og:image"]'),
      twCard: attr('meta[name="twitter:card"]'),
      twTitle: attr('meta[name="twitter:title"]'),
      robots: attr('meta[name="robots"]'),
      h1: document.querySelectorAll("h1").length,
      jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
        (s) => s.textContent,
      ),
    };
  });

  if (!head.title || head.title.length < 10) issues.push("title missing or too short");
  if (head.title && head.title.length > 65) issues.push(`title too long (${head.title.length})`);
  if (!head.description || head.description.length < 40) issues.push("description missing or thin");
  if (head.description && head.description.length > 160) issues.push("description over 160 chars");
  if (!head.canonical?.includes(route === "/" ? "/" : route)) issues.push("canonical does not self-reference");
  for (const [k, v] of Object.entries({
    "og:title": head.ogTitle,
    "og:description": head.ogDescription,
    "og:type": head.ogType,
    "og:url": head.ogUrl,
    "twitter:card": head.twCard,
    "twitter:title": head.twTitle,
  })) {
    if (!v) issues.push(`${k} missing`);
  }
  if (route.startsWith("/product/") && !head.ogImage) issues.push("og:image missing");
  if (head.h1 !== 1) issues.push(`expected exactly one <h1>, found ${head.h1}`);

  if (route.startsWith("/product/")) {
    const parsed = head.jsonLd.map((t) => {
      try {
        return JSON.parse(t);
      } catch {
        return null;
      }
    });
    const product = parsed.find((j) => j && j["@type"] === "Product");
    if (!product) issues.push("Product JSON-LD missing or invalid");
    else {
      if (!product.name) issues.push("JSON-LD name missing");
      if (!product.offers?.price && product.offers?.price !== 0) issues.push("JSON-LD price missing");
      if (!product.offers?.availability) issues.push("JSON-LD availability missing");
    }
  }

  return issues;
}

const routes = await collectRoutes();

/**
 * Reuse a Chromium already present on the machine when the bundled revision
 * has not been downloaded (CI sandboxes, offline machines).
 */
function localChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const root = "/opt/ms-playwright";
  if (!existsSync(root)) return undefined;
  return readdirSync(root)
    .filter((d) => d.startsWith("chromium-"))
    .map((d) => `${root}/${d}/chrome-linux/chrome`)
    .find((p) => existsSync(p));
}

const executablePath = localChromium();
const browser = await chromium.launch(executablePath ? { executablePath } : {});

const page = await browser.newPage();

let failed = 0;
for (const route of routes) {
  let issues;
  try {
    issues = await audit(page, route);
  } catch (e) {
    issues = [`could not load page: ${e.message}`];
  }
  if (issues.length) {
    failed++;
    console.log(`✗ ${route}`);
    issues.forEach((i) => console.log(`    · ${i}`));
  } else {
    console.log(`✓ ${route}`);
  }
}

await browser.close();
console.log(`\n${routes.length - failed}/${routes.length} URLs fully SEO-valid.`);
process.exit(failed ? 1 : 0);
