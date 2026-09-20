import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useWishlist } from "@/lib/store";

/** Keeps the local wishlist in sync with the signed-in user's saved wishlist. */
export function useWishlistSync() {
  const { user } = useAuth();
  const ids = useWishlist((s) => s.ids);
  const loadedFor = useRef<string | null>(null);
  const lastSynced = useRef<string[]>([]);

  // Load + merge on sign-in
  useEffect(() => {
    if (!user) {
      if (loadedFor.current) {
        loadedFor.current = null;
        useWishlist.getState().clear();
      }
      return;
    }
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    (async () => {
      const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id);
      const remote = (data ?? []).map((r) => r.product_id);
      const local = useWishlist.getState().ids;
      const merged = Array.from(new Set([...remote, ...local]));
      useWishlist.setState({ ids: merged });
      const missing = merged.filter((id) => !remote.includes(id));
      if (missing.length) {
        await supabase.from("wishlists").insert(missing.map((product_id) => ({ user_id: user.id, product_id })));
      }
      lastSynced.current = merged;
    })();
  }, [user]);

  // Push local changes
  useEffect(() => {
    if (!user || loadedFor.current !== user.id) return;
    const prev = lastSynced.current;
    const added = ids.filter((i) => !prev.includes(i));
    const removed = prev.filter((i) => !ids.includes(i));
    if (!added.length && !removed.length) return;
    lastSynced.current = ids;
    (async () => {
      if (added.length)
        await supabase.from("wishlists").insert(added.map((product_id) => ({ user_id: user.id, product_id })));
      if (removed.length)
        await supabase.from("wishlists").delete().eq("user_id", user.id).in("product_id", removed);
    })();
  }, [ids, user]);
}
