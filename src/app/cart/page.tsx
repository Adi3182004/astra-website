"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "ASTRA20" || promoCode.trim().toUpperCase() === "RUNWAY") {
      setDiscountPercent(0.2);
      toast.success("Promo code applied: 20% VIP Discount");
    } else {
      toast.error("Invalid promo code", {
        description: "Try code ASTRA20 for 20% off runway drops.",
      });
    }
  };

  const discountAmount = subtotal * discountPercent;
  const total = subtotal - discountAmount;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-36 pb-20 max-w-4xl mx-auto px-4 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-6">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Your Bag is Empty</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Explore our seasonal drops, raw silk hoodies, and kinetic sneakers to curate your wardrobe.
        </p>
        <Button variant="violet" size="lg" className="mt-8 rounded-full shadow-lg" asChild>
          <Link href="/shop">Explore Runway Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between pb-8 border-b border-border mb-10">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
            Order Review
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-1">
            Shopping Bag ({itemCount})
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive">
          Clear Bag
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <div
              key={`${item.product.id}-${item.size}-${idx}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-3xl bg-card border border-border/80 shadow-md gap-6"
            >
              <div className="flex items-center gap-5">
                <img
                  src={item.product.featuredImage || item.product.images?.[0] || "/placeholder.svg"}
                  alt={item.product.title}
                  className="h-24 w-24 rounded-2xl object-contain bg-background/80 p-2 border border-border/50"
                />
                <div className="space-y-1">
                  <Link href={`/product/${item.product.id}`} className="font-bold text-base hover:text-accent transition-colors line-clamp-1">
                    {item.product.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Size: {item.size || "Standard"}</span>
                    <span>·</span>
                    <span>Color: {item.color || "Standard"}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground block">
                    {formatPrice(item.product.price)}
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                <div className="flex items-center gap-3 border border-border rounded-xl bg-secondary/50 px-3 py-1.5">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="font-bold text-base text-foreground block">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id, item.size)}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 mt-0.5 ml-auto"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-xl space-y-5">
            <h3 className="font-bold text-lg tracking-tight">Order Summary</h3>

            {/* Promo Input */}
            <form onSubmit={applyPromo} className="flex gap-2">
              <Input
                placeholder="Promo code (e.g. ASTRA20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="h-10 text-xs bg-background"
              />
              <Button type="submit" variant="outline" size="sm" className="h-10 px-4 font-semibold text-xs">
                Apply
              </Button>
            </form>

            <div className="space-y-3 pt-3 border-t border-border text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>VIP Discount (20%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Global Express Air Freight</span>
                <span className="text-emerald-500 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-black text-foreground pt-3 border-t border-border">
                <span>Estimated Total</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>

            <Button variant="violet" size="lg" className="w-full gap-2 text-base font-bold rounded-2xl shadow-xl shadow-accent/20" asChild>
              <Link href="/checkout">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Encrypted 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
