# PRIORA by KP — Mobile Ecommerce + Admin

Build a complete Palmonas-style mobile jewelry storefront on top of the existing pink/gold aesthetic, plus a full admin dashboard so you (adi31082004@gmail.com) can manage everything without touching code.

## 1. Backend (Lovable Cloud)

Enable Cloud. Provision:

**Tables (public schema, RLS + grants):**
- `categories` — id, name, slug, image_url, sort_order
- `products` — id, name, slug, description, price, compare_at_price, category_id, stock, is_active, is_featured, sort_order
- `product_images` — id, product_id, url, sort_order
- `banners` — id, title, subtitle, image_url, cta_label, cta_link, position (hero/strip/collection), is_active, sort_order
- `orders` — id, user_id, contact_name, phone, email, address, items (jsonb), subtotal, status, created_at
- `wishlists` — id, user_id, product_id
- `profiles` — id (fk auth.users), full_name, phone
- `user_roles` — id, user_id, role (enum: admin, user) + `has_role()` security-definer fn (per user-roles rules)

**Storage buckets:** `product-images`, `banners`, `categories` (public read).

**Auth:** Email/password + Google. Trigger auto-creates profile on signup. Seed adi31082004@gmail.com as admin via trigger on that specific verified email.

## 2. Storefront (mobile-first, Palmonas-style)

Keep pink theme, Cormorant Garamond, gold sparkles, glass surfaces, rounded-2xl/3xl, 4:5 image ratio.

**Pages / routes:**
- `/` Home — hero banner carousel, category tiles, featured products grid, promo strips, "shop by" sections, testimonials, footer
- `/shop` — all products with filter/sort
- `/category/:slug` — category products
- `/product/:slug` — image gallery (Lens zoom), price, description, qty, add-to-cart, wishlist, related
- `/cart` — line items, qty control, subtotal, "Inquire on WhatsApp" + "Email inquiry" CTAs (prefilled message)
- `/wishlist`
- `/checkout` — contact form → creates order → opens WhatsApp with order summary
- `/auth` — login/signup (email + Google)
- `/account` — profile, order history
- `/admin/*` — admin only

**Mobile chrome:** sticky top nav (logo + search + cart badge), bottom tab bar (Home / Shop / Wishlist / Cart / Account), slide-in category drawer. All data pulled from Cloud — no hardcoded product arrays.

## 3. Admin Panel `/admin`

Gated by `has_role(uid,'admin')`. Sidebar with:
- **Dashboard** — order/product/revenue counters
- **Products** — table + create/edit form (name, price, compare price, category, stock, description, active/featured toggle, multi-image upload with reorder & delete)
- **Categories** — CRUD with image
- **Banners** — CRUD with image, position selector, active toggle, drag-to-reorder
- **Orders** — list, view details, update status (new → confirmed → shipped → delivered → cancelled)
- **Settings** — WhatsApp number, contact email, brand tagline (stored in a `site_settings` singleton row)

All uploads via storage buckets. All edits reflect on storefront instantly (react-query invalidation).

## 4. Seed data

Reuse existing bundled jewelry PNGs to seed ~15 dummy products across 3 categories (Earrings, Bracelets, Necklaces) plus 3 dummy banners so the site looks complete on first load. Admin can replace everything.

## 5. Preserved from current design

- Pink luxury palette + gold sparkle background
- Cormorant Garamond headings, Playfair, glass-cards, rounded corners
- "Infinite elegance" — smooth Framer Motion transitions, ParallaxHero on desktop, mobile-optimized version on phones
- Existing HorizonHeroSection kept as an editorial section on home

## Technical notes (for reference)

- Cart & wishlist: zustand store, persisted to localStorage for guests, synced to `wishlists` table on login
- Admin route guard: `useUserRole()` hook checking `has_role`
- Image uploads: supabase storage `.upload()` → save public URL to row
- WhatsApp link: `https://wa.me/<number>?text=<encoded order>` from site_settings
- Zod validation on all forms
- SEO: dynamic `<title>`/meta per page, JSON-LD Product schema

## Scope note

This is a large build (~30+ files, migrations, admin UI). I'll implement it in one pass end-to-end after your approval. Preview will show a fully populated storefront + working admin on first load.
