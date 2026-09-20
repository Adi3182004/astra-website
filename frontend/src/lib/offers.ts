import { supabase } from "@/integrations/supabase/client";

export type OfferType = "bogo" | "percentage" | "fixed";

export type Offer = {
  id: string;
  title: string;
  code: string;
  type: OfferType;
  buyQty: number; // e.g. 2 (Buy 2)
  getQty: number; // e.g. 1 (Get 1 Free)
  discountValue: number; // % off or flat ₹ off
  minOrderValue: number;
  durationHours: number; // Duration set by admin
  startDate: string; // ISO string
  endDate?: string; // ISO string
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  archivedAt?: string; // ISO string when archived/expired
  history?: Array<{
    action: string;
    timestamp: string;
    note?: string;
  }>;
};

export type OffersConfig = {
  offers: Offer[];
  cursorColor?: string; // Pink / Peach hex
  cursorSize?: number; // Size in px
};

export const DEFAULT_OFFERS: Offer[] = [
  {
    id: "default-bogo-b2g1",
    title: "Buy 2 Get 1 Free (Cheapest Item Free)",
    code: "B2G1",
    type: "bogo",
    buyQty: 2,
    getQty: 1,
    discountValue: 0,
    minOrderValue: 0,
    durationHours: 720,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 720 * 3600 * 1000).toISOString(),
    isActive: true,
    usageCount: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-bogo-b1g1",
    title: "Buy 1 Get 1 Free — Flash Deal",
    code: "B1G1",
    type: "bogo",
    buyQty: 1,
    getQty: 1,
    discountValue: 0,
    minOrderValue: 0,
    durationHours: 168,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 168 * 3600 * 1000).toISOString(),
    isActive: true,
    usageCount: 29,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-deal-monsoon3",
    title: "Monsoon Super Trio (Buy 2 Get 1 Free)",
    code: "MONSOON3",
    type: "bogo",
    buyQty: 2,
    getQty: 1,
    discountValue: 0,
    minOrderValue: 0,
    durationHours: 360,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 360 * 3600 * 1000).toISOString(),
    isActive: true,
    usageCount: 42,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-deal-monsoon4",
    title: "Monsoon Quad Bundle (Buy 3 Get 1 Free)",
    code: "MONSOON4",
    type: "bogo",
    buyQty: 3,
    getQty: 1,
    discountValue: 0,
    minOrderValue: 0,
    durationHours: 360,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 360 * 3600 * 1000).toISOString(),
    isActive: true,
    usageCount: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-pct-priora20",
    title: "20% Off on Orders Above ₹1,499",
    code: "PRIORA20",
    type: "percentage",
    buyQty: 0,
    getQty: 0,
    discountValue: 20,
    minOrderValue: 1499,
    durationHours: 720,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 720 * 3600 * 1000).toISOString(),
    isActive: true,
    usageCount: 65,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-fixed-flat500",
    title: "Flat ₹500 Off on Orders Above ₹2,499",
    code: "FLAT500",
    type: "fixed",
    buyQty: 0,
    getQty: 0,
    discountValue: 500,
    minOrderValue: 2499,
    durationHours: 720,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 720 * 3600 * 1000).toISOString(),
    isActive: true,
    usageCount: 31,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-fixed-welcome100",
    title: "Flat ₹100 Off First Purchase",
    code: "WELCOME100",
    type: "fixed",
    buyQty: 0,
    getQty: 0,
    discountValue: 100,
    minOrderValue: 599,
    durationHours: 720,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 720 * 3600 * 1000).toISOString(),
    isActive: true,
    usageCount: 108,
    createdAt: new Date().toISOString(),
  },
];

export function isOfferExpired(offer: Offer): boolean {
  if (!offer.endDate) return false;
  return new Date(offer.endDate).getTime() <= Date.now();
}

export function isOfferActive(offer: Offer): boolean {
  return offer.isActive && !isOfferExpired(offer);
}

/**
 * 30-Day Retention Policy:
 * Check if an expired or archived offer has exceeded the 30-day retention window.
 */
export function isOfferOlderThan30Days(offer: Offer): boolean {
  const expiryTime = offer.endDate ? new Date(offer.endDate).getTime() : new Date(offer.createdAt).getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - expiryTime > thirtyDaysMs;
}

/**
 * Calculates days remaining before 30-day auto-purge
 */
export function getDaysRemainingInHistory(offer: Offer): number {
  const expiryTime = offer.endDate ? new Date(offer.endDate).getTime() : new Date(offer.createdAt).getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - expiryTime;
  const remainingMs = thirtyDaysMs - elapsed;
  return Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

/**
 * Calculates discount and free items for a cart based on applied offer.
 */
export function calculateCartOfferDiscount(
  cartItems: Array<{ id: string; name: string; price: number; quantity: number }>,
  appliedOffer: Offer | null
): {
  discountAmount: number;
  freeItemNames: string[];
  freeItemIds: string[];       // track exact product IDs that are free (with counts)
  appliedOffer: Offer | null;
  description: string;
} {
  const EMPTY = { discountAmount: 0, freeItemNames: [], freeItemIds: [], appliedOffer: null, description: "" };

  if (!appliedOffer || !isOfferActive(appliedOffer) || !cartItems.length) {
    return EMPTY;
  }

  // Flatten items by quantity to evaluate individual units
  const individualUnits: Array<{ id: string; name: string; price: number }> = [];
  cartItems.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      individualUnits.push({ id: item.id, name: item.name, price: Number(item.price) || 0 });
    }
  });

  const subtotal = individualUnits.reduce((acc, curr) => acc + curr.price, 0);

  // Minimum order value check (applies to all types)
  if (appliedOffer.minOrderValue > 0 && subtotal < appliedOffer.minOrderValue) {
    return {
      ...EMPTY,
      appliedOffer,
      description: `Minimum order ₹${appliedOffer.minOrderValue} required for ${appliedOffer.code}.`,
    };
  }

  if (appliedOffer.type === "bogo") {
    const buyQty  = appliedOffer.buyQty  || 2;
    const getQty  = appliedOffer.getQty  || 1;
    const requiredTotal = buyQty + getQty;  // e.g. B2G1 → 3, B3G1 → 4

    // Not enough items — invalidate so the UI removes the coupon
    if (individualUnits.length < requiredTotal) {
      return {
        ...EMPTY,
        description: `Add ${requiredTotal - individualUnits.length} more item${requiredTotal - individualUnits.length !== 1 ? "s" : ""} for ${appliedOffer.code}`,
      };
    }

    // How many complete "sets" fit? Each set yields getQty free items.
    const completeSets  = Math.floor(individualUnits.length / requiredTotal);
    const numFreeItems  = completeSets * getQty;  // strictly admin-defined

    // Give the cheapest numFreeItems units for free
    const sortedUnits = [...individualUnits].sort((a, b) => a.price - b.price);
    const freeUnits   = sortedUnits.slice(0, numFreeItems);

    const discountAmount = freeUnits.reduce((sum, u) => sum + u.price, 0);

    // Build per-product free-count map (ID-based, not name-based)
    const freeCountById: Record<string, number> = {};
    freeUnits.forEach((u) => {
      freeCountById[u.id] = (freeCountById[u.id] || 0) + 1;
    });

    // freeItemIds: one entry per free unit (for precise quantity matching)
    const freeItemIds  = freeUnits.map((u) => u.id);
    const freeItemNames = freeUnits.map((u) => u.name);

    return {
      discountAmount,
      freeItemNames,
      freeItemIds,
      appliedOffer,
      description: `🎉 ${appliedOffer.title} — ${freeUnits.length} item${freeUnits.length !== 1 ? "s" : ""} FREE (-₹${discountAmount})`,
    };
  }

  if (appliedOffer.type === "percentage") {
    const discountAmount = Math.round((subtotal * appliedOffer.discountValue) / 100);
    return {
      discountAmount,
      freeItemNames: [],
      freeItemIds: [],
      appliedOffer,
      description: `🎉 ${appliedOffer.title} — ${appliedOffer.discountValue}% OFF (-₹${discountAmount})`,
    };
  }

  if (appliedOffer.type === "fixed") {
    const discountAmount = Math.min(subtotal, appliedOffer.discountValue);
    return {
      discountAmount,
      freeItemNames: [],
      freeItemIds: [],
      appliedOffer,
      description: `🎉 ${appliedOffer.title} — Flat ₹${appliedOffer.discountValue} OFF (-₹${discountAmount})`,
    };
  }

  return EMPTY;
}

export type DisplayCartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  qty: number;
  isFree: boolean;
  totalPrice: number;
  parentProductId: string;
  totalOriginalQty: number;
};

/**
 * Splits cart items into Paid Rows and Free BOGO Rows.
 * E.g., for 3 units of same item under Buy 2 Get 1 Free:
 * - Row 1: Item (Qty: 2) @ Regular Price (₹599) -> ₹1,198
 * - Row 2: Item (Qty: 1) -> FREE (BOGO Offer) (₹0)
 */
export function splitCartItemsForBOGO<
  T extends { productId: string; name: string; price: number; image?: string; slug?: string; qty: number }
>(
  cartItems: T[],
  appliedOffer: Offer | null
): DisplayCartItem[] {
  if (!appliedOffer || !isOfferActive(appliedOffer) || appliedOffer.type !== "bogo" || !cartItems.length) {
    return cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image || "",
      slug: item.slug || "",
      qty: item.qty,
      isFree: false,
      totalPrice: item.price * item.qty,
      parentProductId: item.productId,
      totalOriginalQty: item.qty,
    }));
  }

  const requiredTotal = (appliedOffer.buyQty || 2) + (appliedOffer.getQty || 1);
  const totalUnits = cartItems.reduce((s, i) => s + i.qty, 0);

  if (totalUnits < requiredTotal) {
    return cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image || "",
      slug: item.slug || "",
      qty: item.qty,
      isFree: false,
      totalPrice: item.price * item.qty,
      parentProductId: item.productId,
      totalOriginalQty: item.qty,
    }));
  }

  // Create individual units list
  const individualUnits: Array<{ item: T; price: number }> = [];
  cartItems.forEach((item) => {
    for (let i = 0; i < item.qty; i++) {
      individualUnits.push({ item, price: Number(item.price) || 0 });
    }
  });

  // Sort ascending by price so cheapest items are awarded as free
  const sorted = [...individualUnits].sort((a, b) => a.price - b.price);
  const numFreeItems = Math.floor(individualUnits.length / requiredTotal) * (appliedOffer.getQty || 1);
  const freeUnits = sorted.slice(0, numFreeItems);

  // Count free units per productId
  const freeCountByProductId: Record<string, number> = {};
  freeUnits.forEach((u) => {
    freeCountByProductId[u.item.productId] = (freeCountByProductId[u.item.productId] || 0) + 1;
  });

  const result: DisplayCartItem[] = [];

  cartItems.forEach((item) => {
    const freeCount = freeCountByProductId[item.productId] || 0;
    const paidCount = Math.max(0, item.qty - freeCount);

    // 1. Paid portion (if any)
    if (paidCount > 0) {
      result.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image || "",
        slug: item.slug || "",
        qty: paidCount,
        isFree: false,
        totalPrice: item.price * paidCount,
        parentProductId: item.productId,
        totalOriginalQty: item.qty,
      });
    }

    // 2. Free portion (if any)
    if (freeCount > 0) {
      result.push({
        productId: `${item.productId}_free`,
        name: item.name,
        price: 0,
        image: item.image || "",
        slug: item.slug || "",
        qty: freeCount,
        isFree: true,
        totalPrice: 0,
        parentProductId: item.productId,
        totalOriginalQty: item.qty,
      });
    }
  });

  return result;
}

/**
 * Fetch offers config from Supabase site_settings theme
 * Automatically cleans up any offers older than 30 days
 */
export async function fetchOffersConfig(): Promise<OffersConfig> {
  try {
    const { data } = await supabase.from("site_settings").select("theme").eq("id", 1).single();
    const theme = (data?.theme as any) || {};
    const offersConfig = theme.offersConfig as OffersConfig | undefined;

    if (offersConfig && Array.isArray(offersConfig.offers)) {
      // Filter out offers that expired more than 30 days ago (automatic purge)
      const validRetainedOffers = offersConfig.offers.filter((o) => !isOfferOlderThan30Days(o));

      return {
        offers: validRetainedOffers.length > 0 ? validRetainedOffers : DEFAULT_OFFERS,
        cursorColor: offersConfig.cursorColor || "#E06A8B",
        cursorSize: offersConfig.cursorSize || 30,
      };
    }
    return {
      offers: DEFAULT_OFFERS,
      cursorColor: "#E06A8B",
      cursorSize: 30,
    };
  } catch {
    return {
      offers: DEFAULT_OFFERS,
      cursorColor: "#E06A8B",
      cursorSize: 30,
    };
  }
}

/**
 * Save offers config to Supabase site_settings theme
 */
export async function saveOffersConfig(config: OffersConfig): Promise<boolean> {
  try {
    const { data } = await supabase.from("site_settings").select("theme").eq("id", 1).single();
    const currentTheme = (data?.theme as any) || {};

    // Auto-clean any records older than 30 days before saving
    const cleanedOffers = config.offers.filter((o) => !isOfferOlderThan30Days(o));

    const updatedTheme = {
      ...currentTheme,
      offersConfig: {
        ...config,
        offers: cleanedOffers,
      },
    };

    const { error } = await supabase
      .from("site_settings")
      .update({ theme: updatedTheme as any })
      .eq("id", 1);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Failed to save offers config:", e);
    return false;
  }
}

export async function fetchOffers(): Promise<Offer[]> {
  const cfg = await fetchOffersConfig();
  // Customer facing: strictly return only active & non-expired offers
  return cfg.offers.filter(isOfferActive);
}

export async function saveOffers(offers: Offer[]): Promise<boolean> {
  const currentCfg = await fetchOffersConfig();
  return saveOffersConfig({
    ...currentCfg,
    offers,
  });
}
