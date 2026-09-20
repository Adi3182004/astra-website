import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Offer } from "./offers";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  qty: number;
  stock?: number;
};

type CartState = {
  items: CartItem[];
  appliedOffer: Offer | null;
  drawerOpen: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  setAppliedOffer: (offer: Offer | null) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      appliedOffer: null,
      drawerOpen: false,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          const maxStock = item.stock ?? existing?.stock;
          if (existing) {
            const newQty = maxStock != null ? Math.min(existing.qty + qty, Math.max(1, maxStock)) : existing.qty + qty;
            return {
              items: s.items.map((i) =>
                i.productId === item.productId ? { ...i, qty: newQty, stock: maxStock ?? i.stock } : i,
              ),
            };
          }
          const initialQty = maxStock != null ? Math.min(qty, Math.max(1, maxStock)) : qty;
          return { items: [...s.items, { ...item, qty: initialQty }] };
        }),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => {
              if (i.productId !== productId) return i;
              const maxStock = i.stock;
              const clampedQty = maxStock != null ? Math.min(qty, Math.max(0, maxStock)) : qty;
              return { ...i, qty: clampedQty };
            })
            .filter((i) => i.qty > 0),
        })),
      setAppliedOffer: (offer) => set({ appliedOffer: offer }),
      clear: () => set({ items: [], appliedOffer: null }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "priora-cart",
      partialize: (s) => ({ items: s.items, appliedOffer: s.appliedOffer }),
    },
  ),
);

/** Convenience selectors — call these in components to avoid subscribing to the whole store */
export function cartCount(items: CartItem[]) {
  return items.reduce((a, i) => a + i.qty, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((a, i) => a + i.qty * i.price, 0);
}

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: "priora-wishlist" },
  ),
);
