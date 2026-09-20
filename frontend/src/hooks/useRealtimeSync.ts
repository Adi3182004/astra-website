import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

const TABLES = [
  "products",
  "product_images",
  "categories",
  "banners",
  "reviews",
  "site_videos",
  "info_pages",
  "site_settings",
  "service_areas",
] as const;

const LABELS: Record<string, string> = {
  products: "Products",
  product_images: "Product images",
  categories: "Categories",
  banners: "Banners",
  reviews: "Reviews",
  site_videos: "Videos",
  info_pages: "Pages",
  site_settings: "Store settings",
  service_areas: "Delivery areas",
};

type LiveState = {
  connected: boolean;
  lastTable: string | null;
  lastAt: number | null;
  setConnected: (v: boolean) => void;
  ping: (table: string) => void;
};

export const useLiveStatus = create<LiveState>((set) => ({
  connected: false,
  lastTable: null,
  lastAt: null,
  setConnected: (connected) => set({ connected }),
  ping: (table) => set({ lastTable: LABELS[table] ?? table, lastAt: Date.now() }),
}));

/**
 * Keeps every open tab in sync: any admin change is pushed live and the
 * affected queries refetch without a page reload.
 */
export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel("storefront-sync");
    TABLES.forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        useLiveStatus.getState().ping(table);
        qc.invalidateQueries();
      });
    });
    channel.subscribe((status) => {
      useLiveStatus.getState().setConnected(status === "SUBSCRIBED");
    });
    return () => {
      useLiveStatus.getState().setConnected(false);
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
