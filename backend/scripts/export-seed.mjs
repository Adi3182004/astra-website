import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const oldSupabase = createClient(
  "https://jpecveuopkepqjhbotzu.supabase.co",
  "sb_publishable_rqIpRyflqwuj7vFf3hFxUA_E7ebZujg"
);

async function exportSeed() {
  console.log("Fetching data from previous database...");
  const [
    { data: categories },
    { data: products },
    { data: productImages },
    { data: banners },
    { data: siteVideos },
    { data: reviews },
    { data: infoPages },
    { data: siteSettings },
  ] = await Promise.all([
    oldSupabase.from("categories").select("*"),
    oldSupabase.from("products").select("*"),
    oldSupabase.from("product_images").select("*"),
    oldSupabase.from("banners").select("*"),
    oldSupabase.from("site_videos").select("*"),
    oldSupabase.from("reviews").select("*"),
    oldSupabase.from("info_pages").select("*"),
    oldSupabase.from("site_settings").select("*"),
  ]);

  const escapeSql = (val) => {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "number") return val;
    if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  let sql = "\n\n-- ==================== SEED DATA ====================\n";

  if (categories?.length) {
    sql += "\n-- Categories\n";
    for (const c of categories) {
      sql += `INSERT INTO public.categories (id, name, slug, image_url, sort_order, is_active, show_in_menu) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.image_url)}, ${c.sort_order ?? 0}, ${c.is_active ?? true}, ${c.show_in_menu ?? true}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, image_url=EXCLUDED.image_url, sort_order=EXCLUDED.sort_order, is_active=EXCLUDED.is_active, show_in_menu=EXCLUDED.show_in_menu;\n`;
    }
  }

  if (products?.length) {
    sql += "\n-- Products\n";
    for (const p of products) {
      sql += `INSERT INTO public.products (id, name, slug, description, price, compare_at_price, category_id, stock, is_active, is_featured, sort_order, out_of_stock, video_url, show_stock, stock_prefix, stock_suffix) VALUES (${escapeSql(p.id)}, ${escapeSql(p.name)}, ${escapeSql(p.slug)}, ${escapeSql(p.description)}, ${p.price ?? 0}, ${escapeSql(p.compare_at_price)}, ${escapeSql(p.category_id)}, ${p.stock ?? 0}, ${p.is_active ?? true}, ${p.is_featured ?? false}, ${p.sort_order ?? 0}, ${p.out_of_stock ?? false}, ${escapeSql(p.video_url)}, ${p.show_stock ?? true}, ${escapeSql(p.stock_prefix)}, ${escapeSql(p.stock_suffix)}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, description=EXCLUDED.description, price=EXCLUDED.price, compare_at_price=EXCLUDED.compare_at_price, category_id=EXCLUDED.category_id, stock=EXCLUDED.stock, is_active=EXCLUDED.is_active, is_featured=EXCLUDED.is_featured, sort_order=EXCLUDED.sort_order, out_of_stock=EXCLUDED.out_of_stock, video_url=EXCLUDED.video_url, show_stock=EXCLUDED.show_stock, stock_prefix=EXCLUDED.stock_prefix, stock_suffix=EXCLUDED.stock_suffix;\n`;
    }
  }

  if (productImages?.length) {
    sql += "\n-- Product Images\n";
    for (const img of productImages) {
      sql += `INSERT INTO public.product_images (id, product_id, url, sort_order) VALUES (${escapeSql(img.id)}, ${escapeSql(img.product_id)}, ${escapeSql(img.url)}, ${img.sort_order ?? 0}) ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  if (banners?.length) {
    sql += "\n-- Banners\n";
    for (const b of banners) {
      sql += `INSERT INTO public.banners (id, title, subtitle, image_url, cta_label, cta_link, position, is_active, sort_order, video_url) VALUES (${escapeSql(b.id)}, ${escapeSql(b.title)}, ${escapeSql(b.subtitle)}, ${escapeSql(b.image_url)}, ${escapeSql(b.cta_label)}, ${escapeSql(b.cta_link)}, ${escapeSql(b.position)}, ${b.is_active ?? true}, ${b.sort_order ?? 0}, ${escapeSql(b.video_url)}) ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  if (siteVideos?.length) {
    sql += "\n-- Site Videos\n";
    for (const v of siteVideos) {
      sql += `INSERT INTO public.site_videos (id, title, subtitle, video_url, poster_url, is_active, sort_order) VALUES (${escapeSql(v.id)}, ${escapeSql(v.title)}, ${escapeSql(v.subtitle)}, ${escapeSql(v.video_url)}, ${escapeSql(v.poster_url ?? v.thumbnail_url)}, ${v.is_active ?? true}, ${v.sort_order ?? 0}) ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  if (reviews?.length) {
    sql += "\n-- Reviews\n";
    for (const r of reviews) {
      const author = r.author ?? r.author_name ?? "Anonymous";
      const body = r.body ?? r.comment ?? "";
      sql += `INSERT INTO public.reviews (id, author, rating, body, product_id, image_url, is_active, sort_order, video_url) VALUES (${escapeSql(r.id)}, ${escapeSql(author)}, ${r.rating ?? 5}, ${escapeSql(body)}, ${escapeSql(r.product_id)}, ${escapeSql(r.image_url)}, ${r.is_active ?? true}, ${r.sort_order ?? 0}, ${escapeSql(r.video_url)}) ON CONFLICT (id) DO NOTHING;\n`;
    }
  }

  if (infoPages?.length) {
    sql += "\n-- Info Pages\n";
    for (const page of infoPages) {
      const isActive = page.is_active ?? page.is_published ?? true;
      sql += `INSERT INTO public.info_pages (id, slug, title, content, is_active, sort_order, hero_image_url, hero_video_url) VALUES (${escapeSql(page.id)}, ${escapeSql(page.slug)}, ${escapeSql(page.title)}, ${escapeSql(page.content)}, ${isActive}, ${page.sort_order ?? 0}, ${escapeSql(page.hero_image_url)}, ${escapeSql(page.hero_video_url)}) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, hero_image_url=EXCLUDED.hero_image_url, hero_video_url=EXCLUDED.hero_video_url;\n`;
    }
  }

  fs.writeFileSync("backend/supabase/seed_data.sql", sql, "utf-8");
  console.log("Clean seed data generated!");
}

exportSeed().catch(console.error);
