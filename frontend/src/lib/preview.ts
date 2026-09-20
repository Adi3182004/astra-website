/**
 * Storefront preview targets used by the admin "Preview" buttons.
 * Each admin area points at the exact storefront section its changes affect;
 * everything above and below that section is blurred inside the preview frame.
 */
export type PreviewTarget = {
  /** storefront route to load */
  path: string;
  /** value of the section's data-preview attribute */
  focus: string;
  label: string;
};

export const PREVIEW_TARGETS = {
  banners: { path: "/", focus: "banners", label: "Hero banners" },
  categories: { path: "/", focus: "categories", label: "Shop by category" },
  products: { path: "/shop", focus: "products", label: "Product grid" },
  reviews: { path: "/", focus: "reviews", label: "Reviews" },
  videos: { path: "/", focus: "videos", label: "Video section" },
  pages: { path: "/page/about", focus: "page", label: "Info page" },
  media: { path: "/", focus: "banners", label: "Media in use" },
  orders: { path: "/checkout", focus: "checkout", label: "Checkout flow" },
  areas: { path: "/", focus: "pincode", label: "Delivery lookup" },
  theme: { path: "/", focus: "all", label: "Whole storefront" },
  settings: { path: "/", focus: "all", label: "Storefront" },
} satisfies Record<string, PreviewTarget>;

export type PreviewKey = keyof typeof PREVIEW_TARGETS;

/** Builds the storefront URL the preview iframe loads. */
export function previewUrl(key: PreviewKey, opts?: { itemId?: string; path?: string }) {
  const t = PREVIEW_TARGETS[key];
  const params = new URLSearchParams({ __preview: "1", focus: t.focus });
  if (opts?.itemId) params.set("item", opts.itemId);
  return `${opts?.path ?? t.path}?${params.toString()}`;
}
