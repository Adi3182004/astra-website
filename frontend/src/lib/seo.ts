import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SeoInput = {
  title: string;
  description?: string;
  image?: string | null;
  /** path only, e.g. "/product/rose-hoops" */
  canonicalPath?: string;
  type?: "website" | "product" | "article";
  jsonLd?: Record<string, unknown> | null;
  noIndex?: boolean;
};

const SITE_NAME = "PRIORA by KP";

export type SeoOverride = {
  route: string;
  title: string | null;
  description: string | null;
  canonical: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card: string | null;
  json_ld: Record<string, unknown> | null;
  no_index: boolean;
};

/**
 * Admin-authored per-route metadata overrides (edited inline in the admin SEO
 * dashboard). Loaded once per document and cached, so adding this costs the
 * storefront a single tiny request and nothing per page view.
 */
let overridesPromise: Promise<Record<string, SeoOverride>> | null = null;

export function loadSeoOverrides(force = false) {
  if (force) overridesPromise = null;
  overridesPromise ??= (async () => {
    const { data } = await supabase.from("seo_overrides").select("*");
    const map: Record<string, SeoOverride> = {};
    for (const row of (data ?? []) as any[]) map[row.route] = row as SeoOverride;
    return map;
  })();

  return overridesPromise;
}

function useOverride(route: string) {
  const [override, setOverride] = useState<SeoOverride | null>(null);
  useEffect(() => {
    let alive = true;
    loadSeoOverrides().then((map) => alive && setOverride(map[route] ?? null));
    return () => {
      alive = false;
    };
  }, [route]);
  return override;
}


function meta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function link(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Sets title, description, canonical, Open Graph / Twitter tags and optional
 * JSON-LD for the current page. Cleans the JSON-LD up on unmount so pages
 * never inherit each other's structured data.
 */
export function useSeo({
  title,
  description,
  image,
  canonicalPath,
  type = "website",
  jsonLd,
  noIndex,
}: SeoInput) {
  const path = canonicalPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const o = useOverride(path);

  const finalTitle = o?.title || title;
  const desc = (o?.description || description)?.slice(0, 155) ?? "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = o?.canonical || origin + path;
  const img = o?.og_image || image || "";
  const ogTitle = o?.og_title || finalTitle;
  const ogDesc = o?.og_description || desc;
  const card = o?.twitter_card || "summary_large_image";
  const hidden = o?.no_index ?? noIndex;
  const ld = o?.json_ld ? JSON.stringify(o.json_ld) : jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    document.title = finalTitle;
    if (desc) meta('meta[name="description"]', "name", "description", desc);
    meta('meta[property="og:title"]', "property", "og:title", ogTitle);
    if (ogDesc) meta('meta[property="og:description"]', "property", "og:description", ogDesc);
    meta('meta[property="og:type"]', "property", "og:type", type);
    meta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    meta('meta[property="og:url"]', "property", "og:url", url);
    meta('meta[name="twitter:card"]', "name", "twitter:card", card);
    meta('meta[name="twitter:title"]', "name", "twitter:title", ogTitle);
    if (ogDesc) meta('meta[name="twitter:description"]', "name", "twitter:description", ogDesc);
    if (img) {
      meta('meta[property="og:image"]', "property", "og:image", img);
      meta('meta[name="twitter:image"]', "name", "twitter:image", img);
    }
    meta('meta[name="robots"]', "name", "robots", hidden ? "noindex,nofollow" : "index,follow");
    link("canonical", url);

    if (!ld) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = ld;
    script.dataset.seo = "page";
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [finalTitle, desc, ogTitle, ogDesc, card, type, url, img, ld, hidden]);
}


export function productJsonLd(p: {
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  inStock: boolean;
  url: string;
  category?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? undefined,
    image: p.image ? [p.image] : undefined,
    category: p.category ?? undefined,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: p.price,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: p.url,
    },
  };
}

export function collectionJsonLd(name: string, url: string, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 30).map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        url: it.url,
      })),
    },
  };
}
