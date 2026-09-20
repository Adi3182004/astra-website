"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HeartIcon, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardTitle, CardFooter, CardContent } from "@/components/ui/card";
import { cn, formatPrice } from "@/lib/utils";
import { ProductItem } from "@/lib/products-data";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [mounted, setMounted] = React.useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "Standard");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLiked = mounted ? isInWishlist(product.id) : false;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl bg-gradient-to-br from-neutral-600/40 via-neutral-900/60 to-[#8D43F4]/30 p-[1px] shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#8D43F4]/20",
        className
      )}
    >
      <div className="relative flex flex-col h-full rounded-2xl bg-card overflow-hidden">
        {/* Top Media Display */}
        <div className="relative flex h-64 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-800/30 to-card/50 p-4">
          <Link href={`/product/${product.id}`} className="flex h-full w-full items-center justify-center">
            <img
              src={product.featuredImage || product.images?.[0] || "/placeholder.svg"}
              alt={product.title}
              className="max-h-52 w-auto object-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-[-4deg]"
            />
          </Link>

          {/* Badges on Top Left */}
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
            {product.isNewDrop && (
              <Badge variant="violet" className="backdrop-blur-md shadow-sm">
                NEW DROP
              </Badge>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <Badge variant="destructive" className="text-[10px]">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute top-3.5 right-3.5 h-9 w-9 rounded-full bg-background/60 backdrop-blur-md hover:bg-background/90 text-foreground border border-border/50 shadow-sm"
          >
            <HeartIcon
              className={cn(
                "h-4 w-4 transition-all duration-300",
                isLiked ? "fill-destructive stroke-destructive scale-110" : "stroke-foreground"
              )}
            />
            <span className="sr-only">Wishlist</span>
          </Button>
        </div>

        {/* Card Details */}
        <div className="flex flex-col flex-1 justify-between p-5 space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <Link href={`/product/${product.id}`}>
                <h3 className="font-semibold text-lg tracking-tight hover:text-accent transition-colors line-clamp-1">
                  {product.title}
                </h3>
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {product.sizes?.slice(0, 3).map((size) => (
                <button
                  key={size}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded-md border transition-all",
                    selectedSize === size
                      ? "border-accent bg-accent/15 text-accent font-medium"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {size}
                </button>
              ))}
              {product.colors?.[0] && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  {product.colors[0]}
                </Badge>
              )}
            </div>

            <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Price & Add to Cart Footer */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground">
                Price
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant="default"
              onClick={() => addToCart(product, selectedSize)}
              className="gap-1.5 rounded-xl font-medium shadow-sm hover:shadow-md"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add to bag</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
