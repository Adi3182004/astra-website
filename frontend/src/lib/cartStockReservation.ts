import { supabase } from "@/integrations/supabase/client";

export interface StockReservationItem {
  productId: string;
  qty: number;
}

const RESERVATION_TTL_MS = 10 * 60 * 1000; // 10 minutes (BookMyShow style)
const LOCAL_STORAGE_KEY = "priora_stock_reservations";

interface LocalHold {
  sessionId: string;
  productId: string;
  qty: number;
  expiresAt: number;
}

/**
 * Gets clean active holds from local storage and syncs.
 */
function getActiveHolds(): LocalHold[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed: LocalHold[] = JSON.parse(raw);
    const now = Date.now();
    const active = parsed.filter((h) => h.expiresAt > now);
    if (active.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(active));
    }
    return active;
  } catch {
    return [];
  }
}

/**
 * Calculates effective available stock for a product, accounting for active holds.
 */
export function getEffectiveStock(productId: string, rawStock: number, currentSessionId?: string): number {
  const activeHolds = getActiveHolds();
  const holdsForOtherSessions = activeHolds
    .filter((h) => h.productId === productId && (!currentSessionId || h.sessionId !== currentSessionId))
    .reduce((sum, h) => sum + (h.qty || 1), 0);

  return Math.max(0, rawStock - holdsForOtherSessions);
}

/**
 * Places a temporary reservation hold on products for a session/checkout (BookMyShow pattern).
 */
export function placeStockReservation(items: StockReservationItem[], sessionId: string): void {
  try {
    const now = Date.now();
    const expiresAt = now + RESERVATION_TTL_MS;
    const existing = getActiveHolds().filter((h) => h.sessionId !== sessionId);

    const newHolds: LocalHold[] = items.map((i) => ({
      sessionId,
      productId: i.productId,
      qty: i.qty,
      expiresAt,
    }));

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...existing, ...newHolds]));
  } catch (e) {
    console.warn("Could not save stock reservation locally:", e);
  }
}

/**
 * Releases reservation holds for a session (e.g. on payment failure, cart drop, or order completion).
 */
export function releaseStockReservation(sessionId: string): void {
  try {
    const active = getActiveHolds().filter((h) => h.sessionId !== sessionId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(active));
  } catch (e) {
    console.warn("Could not release stock reservation:", e);
  }
}

/**
 * Permanently decrements inventory stock in Supabase upon successful payment verification.
 */
export async function decrementInventoryStock(items: StockReservationItem[]): Promise<void> {
  for (const item of items) {
    try {
      // 1. Fetch live stock
      const { data: prod, error: fetchErr } = await supabase
        .from("products")
        .select("id, stock, out_of_stock")
        .eq("id", item.productId)
        .maybeSingle();

      if (fetchErr || !prod) continue;

      const currentStock = Number(prod.stock ?? 0);
      const newStock = Math.max(0, currentStock - (item.qty || 1));
      const isOutOfStock = newStock <= 0;

      // 2. Update live stock in Supabase
      await supabase
        .from("products")
        .update({
          stock: newStock,
          out_of_stock: isOutOfStock,
        })
        .eq("id", item.productId);
    } catch (err) {
      console.error(`Failed to decrement stock for product ${item.productId}:`, err);
    }
  }
}
