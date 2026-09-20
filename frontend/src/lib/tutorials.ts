export type TutorialStep = {
  title: string;
  body: string;
  /** why the setting exists — shown as a small note */
  why?: string;
  /** CSS selector of the control to spotlight */
  target?: string;
  /** "click" waits for the admin to actually click the control */
  action?: "click";
};

const NAV = (path: string) => `[data-tour="nav-${path}"]`;

export const TUTORIALS: Record<string, { title: string; steps: TutorialStep[] }> = {
  "admin-dashboard": {
    title: "Dashboard tour",
    steps: [
      { title: "Your control centre", body: "Everything you see here is live. Orders and edits appear instantly, with no refresh.", target: '[data-tour="admin-main"]' },
      { title: "The side menu", body: "Each part of the store has its own page. Click Products to see where your jewellery lives.", why: "Knowing where each thing lives saves you hunting later.", target: NAV("products"), action: "click" },
      { title: "Every page has a tutorial", body: "This Tutorial button exists on every admin page and explains that page's settings, step by step.", target: '[data-tour="tutorial-button"]' },
    ],
  },
  "admin-products": {
    title: "Managing products",
    steps: [
      { title: "Add a product", body: "Click 'New product' to open the product form.", why: "Products are what customers browse, add to bag and order.", target: '[data-tour="new-product"]', action: "click" },
      { title: "Name, price, category", body: "Fill in the basics. The web address (slug) is created for you from the name.", target: '[data-tour="product-basics"]' },
      { title: "Two images = hover magic", body: "Image 1 is the product shot, image 2 is a model wearing it — the second appears on hover.", why: "Customers buy more when they can see a piece worn.", target: '[data-tour="product-media"]' },
      { title: "Stock badge", body: "Turn on 'Show stock' to display '3 left', and use prefix/suffix for words like 'Hurry —'.", why: "Scarcity nudges customers to order now.", target: '[data-tour="product-stock"]' },
      { title: "Out of stock", body: "Tick this and the product instantly shows the diagonal Out of Stock badge and is blocked from every cart.", target: '[data-tour="product-oos"]' },
      { title: "Style its text", body: "Open 'Text styling' to give this one product its own name/price/description fonts and colours.", target: '[data-tour="record-style"]' },
    ],
  },
  "admin-categories": {
    title: "Managing categories",
    steps: [
      { title: "Create a category", body: "Click 'New' to add a category such as Rings or Anklets.", why: "Categories build the hamburger menu and the homepage tiles.", target: '[data-tour="new-item"]', action: "click" },
      { title: "Menu image", body: "The image you upload here becomes the round tile in the shop-by-category menu.", target: '[data-tour="cat-media"]' },
      { title: "Show in menu", body: "Untick to keep a category live but hidden from the menu.", target: '[data-tour="cat-flags"]' },
      { title: "Its own look", body: "Text styling lets this category name have its own colour — useful over busy photos.", target: '[data-tour="record-style"]' },
    ],
  },
  "admin-banners": {
    title: "Homepage banners",
    steps: [
      { title: "Add a banner", body: "Click 'New' to create a homepage slide.", target: '[data-tour="new-item"]', action: "click" },
      { title: "Where it shows", body: "'Hero' is the big top slider, 'strip' is the thin scrolling promo, 'collection' is the For Every You row.", target: '[data-tour="banner-position"]' },
      { title: "Media", body: "Image or short video — both work in the same slot and are cropped identically on every screen.", target: '[data-tour="banner-media"]' },
      { title: "Per-banner text colours", body: "This is where each slide gets its own title/subtitle/button colours — so three slides can have three different looks.", why: "Text must stay readable on top of whatever photo you choose.", target: '[data-tour="record-style"]' },
    ],
  },
  "admin-theme": {
    title: "Colours, fonts & wording",
    steps: [
      { title: "Site colours", body: "These 14 swatches drive every surface of the storefront.", target: '[data-tour="theme-colors"]' },
      { title: "Text roles", body: "Headings, body, prices, nav, badges and buttons each get their own font, weight, spacing, casing and colour.", target: '[data-tour="theme-roles"]' },
      { title: "Every word on the site", body: "Below, every fixed piece of copy is listed by where it appears — change its wording and its style.", why: "Anything not tied to a product or banner is edited here.", target: '[data-tour="theme-slots"]' },
      { title: "Preview before publishing", body: "Click Preview to see the live storefront with your changes — customers still see the old version until you save.", target: '[data-tour="theme-preview"]', action: "click" },
      { title: "Undo & reset", body: "Undo steps back one change at a time; Reset returns to the original Priora palette.", target: '[data-tour="theme-undo"]' },
      { title: "Publish it", body: "Save pushes your theme to every open storefront tab instantly.", target: '[data-tour="theme-save"]' },
    ],
  },
  "admin-staff": {
    title: "Staff & permissions",
    steps: [
      {
        title: "Two levels of access",
        body: "Admins can change everything. Editors can only add and edit content — products, categories, banners, reviews, films and pages.",
        why: "Keeps your colours, wording, delivery areas and staff list safe from accidental edits.",
      },
      {
        title: "Add someone",
        body: "Type the email they signed up with, pick Editor or Admin, then press Add.",
        target: '[data-tour="staff-add"]',
        why: "They must have created an account on the store first.",
      },
    ],
  },
  "admin-settings": {
    title: "Store settings",
    steps: [
      { title: "Contact", body: "The WhatsApp number here receives every order. Country code, no plus sign.", target: '[data-tour="set-contact"]' },
      { title: "Announcement bar", body: "Type here and a pink strip appears under the header; empty hides it.", target: '[data-tour="set-announcement"]' },
      { title: "Search placeholders", body: "Add phrases and the search box rotates through them.", why: "It shows customers what they can search for.", target: '[data-tour="set-placeholders"]' },
      { title: "Pincode popup images", body: "These three photos decorate the delivery-check popup.", target: '[data-tour="set-pincode-images"]' },
    ],
  },
  "admin-areas": {
    title: "Delivery areas",
    steps: [
      { title: "Why this page", body: "Customers type a pincode in the header — this list decides whether they get a happy yes or a gentle no.", target: '[data-tour="areas-form"]' },
      { title: "Add a pincode", body: "Enter the pincode with its city and state, and how many days delivery takes.", target: '[data-tour="areas-pincode"]' },
      { title: "Save it", body: "Click Add — the storefront popup starts accepting that pincode immediately.", target: '[data-tour="areas-add"]', action: "click" },
      { title: "Turn areas off", body: "Untick Active to pause an area without deleting it — handy during festivals or stock-outs.", target: '[data-tour="areas-list"]' },
    ],
  },
  "admin-orders": {
    title: "Handling orders",
    steps: [
      { title: "New orders", body: "Orders land here the moment a customer checks out, marked 'new'.", target: '[data-tour="admin-main"]' },
      { title: "Update status", body: "Move an order confirmed → shipped → delivered; customers see it in their account.", target: '[data-tour="admin-main"]' },
    ],
  },
  "admin-media": {
    title: "Media library",
    steps: [
      { title: "Upload once, use anywhere", body: "Drop images and videos here, then copy the link into any product, banner or page.", target: '[data-tour="admin-main"]' },
      { title: "Search & filter", body: "Filter by images or videos and search by file name.", target: '[data-tour="admin-main"]' },
      { title: "Delete carefully", body: "Deleting a file breaks anything still using it.", target: '[data-tour="admin-main"]' },
    ],
  },
  "admin-reviews": {
    title: "Customer reviews",
    steps: [
      { title: "Add a review", body: "Click 'New' and enter the author, rating and their words.", target: '[data-tour="new-item"]', action: "click" },
      { title: "Link to a product", body: "Tie a review to a product so it also shows on that product page.", target: '[data-tour="admin-main"]' },
      { title: "Style it", body: "Text styling changes the reviewer name and review text look for this review only.", target: '[data-tour="record-style"]' },
    ],
  },
  "admin-videos": {
    title: "Video section",
    steps: [
      { title: "Short is best", body: "Clips of about 10 seconds load fastest and loop beautifully.", target: '[data-tour="admin-main"]' },
      { title: "Poster image", body: "A poster keeps the section looking perfect before the video plays.", target: '[data-tour="admin-main"]' },
      { title: "Style it", body: "Give this film's title and subtitle their own colour so they read over the footage.", target: '[data-tour="record-style"]' },
    ],
  },
  "admin-pages": {
    title: "Info pages",
    steps: [
      { title: "Built-in pages", body: "About Us, Support, Shipping & Returns, Privacy, Terms and Contact all live here.", target: '[data-tour="admin-main"]' },
      { title: "Content", body: "Write in plain text — blank lines become paragraphs on the live page.", target: '[data-tour="admin-main"]' },
      { title: "Style it", body: "Set this page's heading and body text styles without touching the rest of the site.", target: '[data-tour="record-style"]' },
    ],
  },
};
