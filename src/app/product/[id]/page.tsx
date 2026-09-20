"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INITIAL_PRODUCTS, ProductItem } from "@/lib/products-data";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ui/product-card";
import { formatPrice } from "@/lib/utils";
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Star,
  Check,
  ArrowLeft,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setProduct(json.data);
          setSelectedImage(json.data.featuredImage || json.data.images?.[0] || "");
          setSelectedSize(json.data.sizes?.[0] || "Standard");
          setSelectedColor(json.data.colors?.[0] || "Standard");
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Using fallback local lookup:", e);
      }

      // Fallback
      const found = INITIAL_PRODUCTS.find((p) => p.id === id || p.slug === id);
      if (found) {
        setProduct(found);
        setSelectedImage(found.featuredImage || found.images?.[0] || "");
        setSelectedSize(found.sizes?.[0] || "Standard");
        setSelectedColor(found.colors?.[0] || "Standard");
      }
      setLoading(false);
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-20 max-w-7xl mx-auto px-4 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-r-transparent" />
        <p className="mt-4 text-xs font-mono text-muted-foreground uppercase">
          Loading Astra Archival Record...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-36 pb-20 max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold">Piece Not Found</h2>
        <p className="text-xs text-muted-foreground mt-2">The requested release does not exist or has concluded its run.</p>
        <Button variant="violet" className="mt-6" asChild>
          <Link href="/shop">Return to Collection</Link>
        </Button>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const relatedProducts = INITIAL_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-muted-foreground hover:text-accent mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Collection</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-card border border-border/80 overflow-hidden flex items-center justify-center p-8 shadow-2xl">
            <img
              src={selectedImage || product.featuredImage || "/placeholder.svg"}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-all duration-500 hover:scale-110"
            />

            {/* Badges */}
            <div className="absolute top-5 left-5 flex flex-col gap-2">
              {product.isNewDrop && (
                <Badge variant="violet" className="shadow-lg">
                  NEW DROP
                </Badge>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <Badge variant="destructive">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-5 right-5 p-3 rounded-full bg-background/70 backdrop-blur-md border border-border shadow-lg text-foreground hover:scale-105 transition-transform"
            >
              <Heart
                className={`w-5 h-5 ${isLiked ? "fill-destructive stroke-destructive" : ""}`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-20 rounded-2xl bg-card border p-1 overflow-hidden transition-all flex-shrink-0 ${
                    selectedImage === img
                      ? "border-accent ring-2 ring-accent/30 scale-105"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                {product.category} · {product.gender}
              </span>
              <div className="flex items-center text-amber-400 gap-1 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pt-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold uppercase tracking-wider">Select Size</span>
                  <span className="text-muted-foreground underline cursor-pointer">Size Guide</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedSize === sz
                          ? "border-accent bg-accent text-white shadow-lg shadow-accent/25"
                          : "border-border bg-card text-foreground hover:border-foreground/40"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="pt-3 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Color: {selectedColor}</span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        selectedColor === col
                          ? "border-accent bg-accent/15 text-accent font-medium"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Add to Bag & Buy Now */}
            <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
              <Button
                variant="violet"
                size="lg"
                onClick={() => addToCart(product, selectedSize, selectedColor, quantity)}
                className="w-full sm:flex-1 h-13 rounded-2xl gap-2 text-base font-bold shadow-xl shadow-accent/20"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Shopping Bag</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  addToCart(product, selectedSize, selectedColor, 1);
                  window.location.href = "/checkout";
                }}
                className="w-full sm:w-auto h-13 rounded-2xl font-bold px-8"
              >
                Instant Buy
              </Button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/30">
              <Truck className="w-5 h-5 text-accent mb-1" />
              <span className="text-[11px] font-semibold">Express Air</span>
              <span className="text-[10px] text-muted-foreground">Complimentary</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/30">
              <ShieldCheck className="w-5 h-5 text-accent mb-1" />
              <span className="text-[11px] font-semibold">NFC Certified</span>
              <span className="text-[10px] text-muted-foreground">100% Genuine</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-secondary/30">
              <RotateCcw className="w-5 h-5 text-accent mb-1" />
              <span className="text-[11px] font-semibold">30 Days</span>
              <span className="text-[10px] text-muted-foreground">Bespoke Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      <div className="mt-28 pt-12 border-t border-border">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8">
          Complete the Look
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
