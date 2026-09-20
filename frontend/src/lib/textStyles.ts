/**
 * Fine-grained text customisation.
 *
 * Two layers exist:
 *  - "slots": every fixed piece of copy on the storefront (section titles,
 *    buttons, footer links, popup copy...). Stored in site_settings.theme.slots.
 *  - per-record styles: stored in each row's `text_style` jsonb column
 *    (banners, categories, products, reviews, videos, pages) so each individual
 *    banner/category can have its own colours and fonts.
 */
import type { CSSProperties } from "react";

export type PartialTextStyle = {
  family?: string;
  weight?: string;
  size?: string;
  lineHeight?: string;
  letterSpacing?: string;
  transform?: "none" | "uppercase" | "capitalize" | "lowercase";
  color?: string;
  backgroundColor?: string;
  background?: string;
  /** optional copy override (slots only) */
  text?: string;
};

export type StyleMap = Record<string, PartialTextStyle>;

export function styleToCss(s?: PartialTextStyle | null): CSSProperties {
  if (!s) return {};
  const css: CSSProperties = {};
  if (s.family) css.fontFamily = s.family;
  if (s.weight) css.fontWeight = s.weight as any;
  if (s.size) css.fontSize = s.size;
  if (s.lineHeight) css.lineHeight = s.lineHeight;
  if (s.letterSpacing) css.letterSpacing = s.letterSpacing;
  if (s.transform) css.textTransform = s.transform;
  if (s.color) css.color = s.color;
  if (s.backgroundColor) css.backgroundColor = s.backgroundColor;
  if (s.background) css.background = s.background;
  return css;
}

/** Field sets used by the per-record editors in the admin forms. */
export const RECORD_FIELDS: Record<string, { key: string; label: string }[]> = {
  banners: [
    { key: "title", label: "Banner title" },
    { key: "subtitle", label: "Banner subtitle" },
    { key: "cta", label: "Button label" },
  ],
  categories: [{ key: "name", label: "Category name (menu + tiles)" }],
  products: [
    { key: "name", label: "Product name" },
    { key: "price", label: "Price" },
    { key: "description", label: "Description" },
    { key: "stock", label: "Stock badge" },
  ],
  reviews: [
    { key: "author", label: "Reviewer name" },
    { key: "body", label: "Review text" },
  ],
  site_videos: [
    { key: "title", label: "Film / Reel title" },
    { key: "subtitle", label: "Film / Reel subtitle" },
  ],
  info_pages: [
    { key: "title", label: "Page title" },
    { key: "content", label: "Page body text" },
  ],
};

export type SlotDef = { key: string; label: string; defaultText?: string };
export type SlotGroup = { group: string; hint: string; slots: SlotDef[] };

/** Every fixed word on the storefront, grouped by where it appears. */
export const SLOT_GROUPS: SlotGroup[] = [
  {
    group: "Home — section titles",
    hint: "Headings between the sections on the homepage.",
    slots: [
      { key: "home.categories.title", label: "Shop by Category heading", defaultText: "Shop by Category" },
      { key: "home.categories.link", label: "Categories 'All' link", defaultText: "All" },
      { key: "home.bestsellers.title", label: "Bestsellers heading", defaultText: "Bestsellers" },
      { key: "home.bestsellers.link", label: "Bestsellers 'All' link", defaultText: "All" },
      { key: "home.newArrivals.title", label: "New Arrivals heading", defaultText: "New Arrivals" },
      { key: "home.shopAll.button", label: "Shop All button", defaultText: "Shop All" },
      { key: "home.forEveryYou.title", label: "For Every You heading", defaultText: "For Every You" },
      { key: "home.videos.title", label: "The KP Chapter heading", defaultText: "The KP Chapter" },
      { key: "home.reviews.title", label: "Reviews heading", defaultText: "Trusted by our community" },
    ],
  },
  {
    group: "Home — trust bar",
    hint: "The three promises under the reviews.",
    slots: [
      { key: "home.trust.1.label", label: "Promise 1 title", defaultText: "Free Shipping" },
      { key: "home.trust.1.sub", label: "Promise 1 subtitle", defaultText: "Above ₹999" },
      { key: "home.trust.2.label", label: "Promise 2 title", defaultText: "365-Day" },
      { key: "home.trust.2.sub", label: "Promise 2 subtitle", defaultText: "Anti-Tarnish" },
      { key: "home.trust.3.label", label: "Promise 3 title", defaultText: "Easy Returns" },
      { key: "home.trust.3.sub", label: "Promise 3 subtitle", defaultText: "7-day" },
    ],
  },
  {
    group: "Delivery pincode popup",
    hint: "The 'Enter your pincode' popup opened from the header.",
    slots: [
      { key: "pincode.title", label: "Popup heading", defaultText: "Enter Your Pincode" },
      { key: "pincode.subtitle", label: "Popup helper text", defaultText: "Your PIN code helps you get faster delivery dates and see the nearest stores." },
      { key: "pincode.placeholder", label: "Input placeholder", defaultText: "Enter Your Pincode Here" },
      { key: "pincode.button", label: "Submit button", defaultText: "Check" },
      { key: "pincode.success", label: "Deliverable message", defaultText: "Yay! We deliver to you ✨" },
      { key: "pincode.fail", label: "Not-deliverable message", defaultText: "Oops — we're not there yet 🥺" },
      { key: "pincode.failHint", label: "Not-deliverable helper", defaultText: "Message us on WhatsApp, we'll try our best for you." },
      { key: "pincode.trigger", label: "Header 'Enter Pincode' link", defaultText: "Enter Pincode" },
    ],
  },
  {
    group: "Product cards & product page",
    hint: "Words that repeat on every product.",
    slots: [
      { key: "product.outOfStock", label: "Out of stock badge", defaultText: "Out of Stock" },
      { key: "product.addToBag", label: "Add to bag button", defaultText: "Add to Bag" },
      { key: "product.buyNow", label: "Buy now button", defaultText: "Buy Now" },
    ],
  },
  {
    group: "Menu & navigation",
    hint: "Hamburger menu and bottom bar wording.",
    slots: [
      { key: "menu.categoriesTitle", label: "'Shop by Category' in menu", defaultText: "Shop by Category" },
      { key: "menu.helpTitle", label: "Help section title in menu", defaultText: "Need help?" },
    ],
  },
  {
    group: "Footer",
    hint: "Links and small print at the bottom of every page.",
    slots: [
      { key: "footer.shop", label: "Shop link", defaultText: "Shop" },
      { key: "footer.about", label: "About link", defaultText: "About Us" },
      { key: "footer.support", label: "Support link", defaultText: "Support" },
      { key: "footer.shipping", label: "Shipping Policy link", defaultText: "Shipping Policy" },
      { key: "footer.privacy", label: "Privacy link", defaultText: "Privacy Policy" },
      { key: "footer.terms", label: "Terms link", defaultText: "Terms" },
      { key: "footer.contact", label: "Contact link", defaultText: "Contact" },
      { key: "footer.account", label: "Account link", defaultText: "Account" },
      { key: "footer.copyright", label: "Copyright line", defaultText: "© {year} PRIORA by KP · Jewellery that reflects your Aura" },
    ],
  },
  {
    group: "Cart & checkout",
    hint: "Bag and order wording.",
    slots: [
      { key: "cart.title", label: "Cart heading", defaultText: "Your Bag" },
      { key: "cart.empty", label: "Empty cart message", defaultText: "Your bag is empty" },
      { key: "cart.checkout", label: "Checkout button", defaultText: "Checkout" },
      { key: "checkout.title", label: "Checkout heading", defaultText: "Checkout" },
      { key: "checkout.submit", label: "Place order button", defaultText: "Place Order on WhatsApp" },
    ],
  },
];

export const ALL_SLOTS: SlotDef[] = SLOT_GROUPS.flatMap((g) => g.slots);

export function slotDefault(key: string) {
  return ALL_SLOTS.find((s) => s.key === key)?.defaultText ?? "";
}
