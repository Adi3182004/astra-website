"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("astra_wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved wishlist", e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("astra_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, mounted]);

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        toast.info("Already in Wishlist", {
          description: `${item.name} is already saved.`,
        });
        return prev;
      }
      toast.success("Saved to Wishlist!", {
        description: `${item.name} has been added to your favorites.`,
      });
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    toast.info("Removed from Wishlist");
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
