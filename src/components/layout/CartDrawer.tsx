"use client";

import React from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    itemCount,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-md animate-fade-in"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold tracking-tight">Shopping Bag</h2>
            <span className="text-xs font-mono text-muted-foreground">({itemCount} items)</span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Your bag is empty</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Explore our luxury footwear and oversized silk collections to add items.
                </p>
              </div>
              <Button
                variant="violet"
                onClick={() => setIsCartOpen(false)}
                className="mt-2"
                asChild
              >
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.size}-${idx}`}
                className="flex gap-4 p-3.5 rounded-2xl bg-secondary/40 border border-border/70"
              >
                <img
                  src={item.product.featuredImage || item.product.images?.[0] || "/placeholder.svg"}
                  alt={item.product.title}
                  className="h-20 w-20 rounded-xl object-contain bg-background/80 p-1"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.product.title}</h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.size && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          {item.size}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-foreground">
                        {formatPrice(item.product.price)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 border border-border rounded-lg bg-card px-2 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-accent">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-border bg-card/95 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shipping (Complimentary Express)</span>
                <span className="text-emerald-500 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-accent">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Button
              variant="violet"
              size="lg"
              className="w-full gap-2 text-base font-semibold rounded-xl"
              onClick={() => setIsCartOpen(false)}
              asChild
            >
              <Link href="/checkout">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
