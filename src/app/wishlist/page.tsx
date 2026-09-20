"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { INITIAL_PRODUCTS } from "@/lib/products-data";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useCart();

  const savedProducts = INITIAL_PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pb-8 border-b border-border mb-10">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to shop</span>
        </Link>
        <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold block">
          Personal Wardrobe
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mt-1">
          Saved Pieces ({wishlist.length})
        </h1>
      </div>

      {savedProducts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Heart className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">Your wishlist is empty</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Click the heart icon on any sneaker or apparel piece to save it for later review.
          </p>
          <Button variant="violet" className="mt-2 rounded-xl" asChild>
            <Link href="/shop">Explore Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
