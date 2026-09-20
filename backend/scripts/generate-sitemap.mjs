/**
 * Builds sitemap.xml from the live catalogue.
 *
 * Used in three places, so the sitemap is never stale:
 *  - `npm run build` (writes public/sitemap.xml before Vite bundles)
 *  - the Vite dev server (`/sitemap.xml` is generated on request, so a product
 *    you add in the admin shows up immediately on localhost)
 *  - `npm run sitemap` for a manual refresh
 *
 * Fails soft: if the database is unreachable the static routes are still written.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const MAX_URLS = 5000;
// Set SITE_URL in the environment once the store has its own domain.
const SITE = (process.env.SITE_URL || "").replace(/\/$/, "");

function env(key) {
  if (process.env[key]) return process.env[key];
  const backendEnv = resolve(process.cwd(), "backend/.env");
  const rootEnv = resolve(process.cwd(), ".env");
  const file = existsSync(backendEnv) ? backendEnv : rootEnv;
  if (!existsSync(file)) return undefined;
  const line = readFileSync(file, "utf8")
    .split("\n")
    .find((l) => l.startsWith(`${key}=`));
  return line?.slice(key.length + 1).trim().replace(/^["']|["']$/g, "");
}

async function rows(table, select) {
  const url = env("VITE_SUPABASE_URL") || "https://oriibywxhetfpcpstdyk.supabase.co";
  const key = env("VITE_SUPABASE_PUBLISHABLE_KEY") || env("VITE_SUPABASE_ANON_KEY") || "sb_publishable_Ku9PVVi8kpH_EJXVCiFWvw_OXeEZS0y";
  if (!url || !key) return [];
  try {
    const isNew = key.startsWith("sb_publishable_") || key.startsWith("sb_secret_");
    const headers = { apikey: key };
    if (!isNew) headers.Authorization = `Bearer ${key}`;
    const res = await fetch(
      `${url}/rest/v1/${table}?select=${select}&is_active=eq.true&limit=${MAX_URLS}`,
      { headers },
    );
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

/** Returns the sitemap XML as a string. */
export async function buildSitemap() {
  const [products, categories, pages] = await Promise.all([
    rows("products", "slug,updated_at"),
    rows("categories", "slug,updated_at"),
    rows("info_pages", "slug,updated_at"),
  ]);

  const staticPaths = ["/", "/shop", "/wishlist", "/cart"];
  const entries = [
    ...staticPaths.map((p) => ({ loc: p, priority: p === "/" ? "1.0" : "0.7" })),
    ...categories.map((c) => ({ loc: `/category/${c.slug}`, lastmod: c.updated_at, priority: "0.8" })),
    ...products.map((p) => ({ loc: `/product/${p.slug}`, lastmod: p.updated_at, priority: "0.9" })),
    ...pages.map((p) => ({ loc: `/page/${p.slug}`, lastmod: p.updated_at, priority: "0.5" })),
  ].slice(0, MAX_URLS);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url><loc>${SITE}${e.loc}</loc>${e.lastmod ? `<lastmod>${new Date(e.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}<priority>${e.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>
`;
  return { xml, count: entries.length };
}

/** Writes public/sitemap.xml. */
export async function writeSitemap(cwd = process.cwd()) {
  const { xml, count } = await buildSitemap();
  const frontendPublic = resolve(cwd, "frontend/public");
  const targetDir = existsSync(frontendPublic) ? frontendPublic : resolve(cwd, "public");
  writeFileSync(resolve(targetDir, "sitemap.xml"), xml);
  return count;
}

// Run directly: node scripts/generate-sitemap.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const count = await writeSitemap();
  console.log(`sitemap.xml written with ${count} urls`);
}
