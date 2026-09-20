"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package, Truck, CheckCircle2, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setOrders(json.data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Could not fetch orders from API:", e);
      }

      // Default mock orders for portfolio showcase demo
      setOrders([
        {
          orderNumber: "ASTRA-892144-702",
          customer: {
            fullName: "Alexander Vance",
            city: "New York",
            country: "United States",
          },
          items: [
            {
              title: "Astra Jordan Air Rev",
              price: 69.99,
              size: "EU 38",
              color: "Black and White",
              image: "https://cdn.21st.dev/assets/mirror/b5/b53e247c16c9009c0c84b479f179878b30db90aa2b6c483b5317f9c3cc185ba1.png",
              quantity: 1,
            },
            {
              title: "Astra Heavyweight Raw Silk Hoodie",
              price: 145.0,
              size: "L",
              color: "Obsidian Onyx",
              image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
              quantity: 1,
            },
          ],
          total: 214.99,
          orderStatus: "confirmed",
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ]);
      setLoading(false);
    }

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pb-8 border-b border-border mb-10">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to collection</span>
        </Link>
        <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold block">
          Client Archive
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mt-1">
          Archived Orders & Tracking
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs font-mono">Loading order tracking records...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold">No orders placed yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Your confirmed purchases from the runway archive will appear here with live tracking telemetry.
          </p>
          <Button variant="violet" className="mt-2" asChild>
            <Link href="/shop">Explore Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord, idx) => (
            <div
              key={ord.orderNumber || idx}
              className="p-7 rounded-3xl bg-card border border-border/80 shadow-xl space-y-6"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Order ID</span>
                  <h3 className="font-mono font-bold text-lg text-accent">{ord.orderNumber}</h3>
                  <span className="text-xs text-muted-foreground">
                    Placed {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="violet" className="gap-1 px-3 py-1 font-mono text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CONFIRMED & DISPATCHED</span>
                  </Badge>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {ord.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/40">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-16 w-16 rounded-xl object-contain bg-background/80 p-1 border border-border"
                      />
                      <div>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          Size: {item.size || "Standard"} · Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tracking Progress */}
              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>Air Courier: DHL Express Worldwide</span>
                  <span>Estimated Delivery: 2 Business Days</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-cyan-400 w-3/4 rounded-full" />
                </div>
              </div>

              {/* Total */}
              <div className="pt-2 flex justify-between items-baseline font-bold text-lg">
                <span>Total Amount Paid</span>
                <span className="text-accent">{formatPrice(ord.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
