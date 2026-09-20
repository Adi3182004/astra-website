import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart, cartSubtotal } from "@/lib/store";
import { useAuth } from "./useAuth";
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
 * Keeps a snapshot of the shopper's bag so staff can follow up on WhatsApp.
 * Debounced, and marks the snapshot recovered once the bag is emptied
 * (checkout clears the cart).
 */
export function useAbandonedCart() {
  const items = useCart((s) => s.items);
  const subtotal = cartSubtotal(items);
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const session_key = sessionKey();
      if (!items.length) {
        await supabase.from("abandoned_carts").update({ recovered: true }).eq("session_key", session_key);
        return;
      }
      await supabase.from("abandoned_carts").upsert(
        {
          session_key,
          user_id: user?.id ?? null,
          contact_name: profile?.full_name ?? null,
          phone: profile?.phone ?? null,
          email: profile?.email ?? user?.email ?? null,
          items: items as any,
          subtotal,
          recovered: false,
        },
        { onConflict: "session_key" },
      );
    }, 2500);
    return () => clearTimeout(timer.current);
  }, [items, subtotal, user?.id, user?.email, profile?.full_name, profile?.phone, profile?.email]);
}
