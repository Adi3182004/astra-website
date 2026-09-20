import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCart, cartSubtotal, type CartItem } from "@/lib/store";
import { useProfile } from "./useProfile";

const KEY = "priora-session-key";

function sessionKey() {
  let k = localStorage.getItem(KEY);
  if (!k) {
    k = crypto.randomUUID();
    localStorage.setItem(KEY, k);
  }
  return k;
}

/**
 * Keeps the customer's cart in sync with Supabase:
 * 1. On login, loads the user's saved cart from Supabase and merges with any guest items.
 * 2. Saves cart updates to Supabase under the customer's user_id so they can pick up where they left off.
 * 3. On logout, clears the local cart state and resets session so multiple users on one device stay isolated.
 */
export function useCartSync() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const items = useCart((s) => s.items);
  const subtotal = cartSubtotal(items);
  const loadedFor = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // 1. On sign-in: restore user's cart from Supabase
  useEffect(() => {
    if (!user) {
      if (loadedFor.current) {
        // User just logged out: clear state for security and multi-user isolation
        loadedFor.current = null;
        useCart.getState().clear();
      }
      return;
    }

    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;

    (async () => {
      try {
        const { data } = await supabase
          .from("abandoned_carts")
          .select("items")
          .eq("user_id", user.id)
          .eq("recovered", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const remoteItems: CartItem[] = Array.isArray(data?.items) ? (data.items as any) : [];
        const localItems = useCart.getState().items;

        if (remoteItems.length > 0) {
          // Merge remote items with any local items
          const itemMap = new Map<string, CartItem>();
          for (const item of remoteItems) {
            if (item && item.productId) {
              itemMap.set(item.productId, { ...item });
            }
          }
          for (const item of localItems) {
            if (item && item.productId) {
              const existing = itemMap.get(item.productId);
              if (existing) {
                existing.qty = Math.max(existing.qty, item.qty);
              } else {
                itemMap.set(item.productId, { ...item });
              }
            }
          }

          const merged = Array.from(itemMap.values());
          useCart.setState({ items: merged });
        }
      } catch (err) {
        console.error("Failed to load user cart:", err);
      }
    })();
  }, [user]);

  // 2. On cart modification: sync to Supabase (debounced)
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const session_key = sessionKey();
      if (!items.length) {
        if (user) {
          await supabase.from("abandoned_carts").update({ recovered: true }).eq("user_id", user.id);
        } else {
          await supabase.from("abandoned_carts").update({ recovered: true }).eq("session_key", session_key);
        }
        return;
      }

      await supabase.from("abandoned_carts").upsert(
        {
          session_key,
          user_id: user?.id ?? null,
          contact_name: profile?.full_name ?? user?.user_metadata?.full_name ?? null,
          phone: profile?.phone ?? null,
          email: profile?.email ?? user?.email ?? null,
          items: items as any,
          subtotal,
          recovered: false,
        },
        { onConflict: "session_key" }
      );
    }, 1500);

    return () => clearTimeout(saveTimer.current);
  }, [items, subtotal, user, profile]);
}
