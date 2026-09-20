# PRIORA by KP — jewellery storefront

A mobile-first jewellery e-commerce site with a full admin CMS: products,
categories, banners, videos, reviews, info pages, media library, orders,
delivery areas, theme/typography editor, change history with rollback and
per-section live previews.

Stack: React 18 + TypeScript + Vite + Tailwind + shadcn-style UI, with
Supabase (Postgres, auth, storage, realtime) as the backend.

## Running locally (works fully offline from a git clone)

```bash
npm install
npm run dev          # http://localhost:8080
```

Everything the app needs is in `.env` (already committed):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

These are publishable keys — safe in the repo. All data access is protected by
row-level security, so admin actions still require an admin login.

Notes for local development:

- **Live updates / realtime** work on localhost — they use the backend's
  realtime socket, not the hosting platform.
- **Admin previews** load the storefront from the same origin
  (`http://localhost:8080`), so they work locally too.
- **Sitemap** is generated on request in dev (`/sitemap.xml`) and written to
  `public/sitemap.xml` on every build, so it always matches the catalogue.
- Set `SITE_URL=https://yourdomain.com` before `npm run build` to emit absolute
  URLs in the sitemap.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | Regenerates the sitemap and builds for production |
| `npm run preview` | Serves the production build |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | Playwright end-to-end suite |
| `npm run seo:check` | Crawls every product/category/page URL and validates meta tags |
| `npm run sitemap` | Rewrites `public/sitemap.xml` |

## Admin

Sign in with an admin account and open `/admin`. Admin capabilities:

- Products (with stock counts, out-of-stock state, dual hover images)
- Categories, banners, videos, reviews, info pages, media library
- Orders and abandoned carts, with WhatsApp follow-up
- Delivery areas (pincode lookup)
- Theme editor: colours, typography, contrast checker, export/import
- **SEO** dashboard: crawls every public URL and reports missing or invalid
  title / description / canonical / Open Graph / Twitter / JSON-LD tags
- History: versioned audit log with one-click rollback

## Continuous integration

`.github/workflows/ci.yml` runs the build, the Playwright suite and the SEO
checker on every push and pull request, and posts a summarised report into the
build logs (job summary) plus uploads the full logs as artifacts.

## Deployment

Any static host works (`npm run build` → `dist/`). Configure the host to
rewrite unknown paths to `index.html` so client-side routes resolve.
