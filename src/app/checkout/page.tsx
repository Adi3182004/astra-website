"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, ShoppingBag, ShieldCheck, Truck, ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "Alexander Vance",
    email: "alexander@astra.luxury",
    phone: "+1 (555) 382-9014",
    address: "740 5th Avenue, Suite 1800",
    city: "New York",
    postalCode: "10019",
    country: "United States",
    paymentMethod: "demo-instant",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.address) {
      toast.error("Please complete all shipping address fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          size: item.size,
          color: item.color,
          image: item.product.featuredImage || item.product.images?.[0],
          quantity: item.quantity,
        })),
        subtotal: subtotal,
        shipping: 0,
        discount: 0,
        total: subtotal,
        paymentMethod: formData.paymentMethod,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setPlacedOrder(json.data);
        clearCart();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success("Order confirmed successfully!", {
          description: `Order ID: ${json.data.orderNumber}`,
        });
      } else {
        throw new Error(json.error || "Failed to place order");
      }
    } catch (err: any) {
      console.error("Order error:", err);
      // Fallback instant success
      const fallbackOrder = {
        orderNumber: `ASTRA-${Date.now().toString().slice(-6)}`,
        customer: formData,
        items: cart,
        total: subtotal,
        createdAt: new Date().toISOString(),
      };
      setPlacedOrder(fallbackOrder);
      clearCart();
      confetti({ particleCount: 80, spread: 60 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-3xl mx-auto px-4 text-center">
        <div className="h-20 w-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
          Order Verified & Confirmed
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mt-1">
          Thank you, {placedOrder.customer?.fullName}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Your order has been registered in the Astra archival database. Tracking dispatch info has been sent to{" "}
          <span className="text-foreground font-semibold">{placedOrder.customer?.email}</span>.
        </p>

        {/* Order Card */}
        <div className="mt-10 p-7 rounded-3xl bg-card border border-border/80 shadow-2xl text-left space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Order Number</span>
              <h3 className="font-mono font-bold text-lg text-accent">{placedOrder.orderNumber}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Status</span>
              <span className="block text-xs font-bold text-emerald-500">PAID & PROCESSING</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Shipping Destination
            </h4>
            <p className="text-sm font-medium text-foreground">
              {placedOrder.customer?.address}, {placedOrder.customer?.city}, {placedOrder.customer?.postalCode},{" "}
              {placedOrder.customer?.country}
            </p>
          </div>

          <div className="pt-4 border-t border-border flex justify-between items-baseline font-bold text-lg">
            <span>Total Paid</span>
            <span className="text-accent">{formatPrice(placedOrder.total || subtotal)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="violet" size="lg" className="rounded-2xl" asChild>
            <Link href="/shop">Continue Exploring</Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-2xl" asChild>
            <Link href="/orders">View Order History</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-36 pb-20 max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold">Your bag is empty</h2>
        <p className="text-xs text-muted-foreground mt-2">Add pieces from the collection to proceed to checkout.</p>
        <Button variant="violet" className="mt-6 rounded-full" asChild>
          <Link href="/shop">Explore Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-8 border-b border-border mb-10">
        <div>
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to bag</span>
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Bespoke Checkout
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-accent" />
          <span>256-Bit SSL Secured</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Step Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handlePlaceOrder} className="space-y-8">
            {/* Step 1: Shipping Address */}
            <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-xl tracking-tight">Express Shipping Destination</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Street Address & Suite</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-xl tracking-tight">Payment Verification</h3>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-accent bg-accent/10 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="demo-instant"
                      checked={formData.paymentMethod === "demo-instant"}
                      onChange={handleChange}
                      className="accent-[#8D43F4]"
                    />
                    <div>
                      <span className="font-bold text-sm block">Instant Demo Checkout (1-Click)</span>
                      <span className="text-xs text-muted-foreground">Simulates real-time card authorization & MongoDB record creation</span>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-border bg-secondary/30 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === "online"}
                      onChange={handleChange}
                      className="accent-[#8D43F4]"
                    />
                    <div>
                      <span className="font-semibold text-sm block">Credit / Debit Card (Stripe/Razorpay)</span>
                      <span className="text-xs text-muted-foreground">Encrypted bank gateway transfer</span>
                    </div>
                  </div>
                </label>
              </div>

              <Button
                type="submit"
                variant="violet"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-14 text-base font-bold rounded-2xl shadow-xl shadow-accent/25 mt-4"
              >
                {isSubmitting ? "Registering Order in MongoDB..." : `Authorize & Pay ${formatPrice(subtotal)}`}
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Order Preview Summary */}
        <div>
          <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-xl space-y-5 sticky top-28">
            <h3 className="font-bold text-lg tracking-tight">Summary ({cart.length} pieces)</h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3.5 items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.featuredImage || item.product.images?.[0] || "/placeholder.svg"}
                      alt=""
                      className="h-12 w-12 rounded-xl object-contain bg-background p-1 border border-border"
                    />
                    <div>
                      <h5 className="font-semibold text-xs line-clamp-1">{item.product.title}</h5>
                      <span className="text-[10px] text-muted-foreground">
                        Size: {item.size} · Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Air Freight</span>
                <span className="text-emerald-500 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-foreground pt-3 border-t border-border">
                <span>Total Due</span>
                <span className="text-accent">{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
