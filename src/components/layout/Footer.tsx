"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KineticFabric } from "@/components/ui/kinetic-particle-fabric";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed to Astra Private Runway Archive", {
      description: "You will receive early drop access and exclusive member editorial updates.",
    });
    setEmail("");
  };

  return (
    <footer className="relative bg-card/90 backdrop-blur-2xl border-t border-border/80 pt-16 pb-12 text-foreground overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-[#8D43F4]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Interactive Kinetic 3D Physics Mesh at Footer Base */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
              Interactive Physics Lab
            </span>
            <span className="text-[11px] font-mono text-muted-foreground uppercase">
              Tensor 3D Simulation
            </span>
          </div>
          <KineticFabric headline="ASTRA" tagline="TENSOR · 3D DYNAMICS" />
        </div>

        {/* Brand Perks Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-border">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Complimentary Global Express</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Air freight dispatch in 24 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">100% Certified Authentic</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Individually serialized NFC tags</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">30-Day Bespoke Exchange</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Hassle-free size & style swaps</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Couture Craftsmanship</h4>
              <p className="text-xs text-muted-foreground mt-0.5">520 GSM silk & carbon sole builds</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-4">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#8D43F4] to-cyan-400 flex items-center justify-center text-white font-black text-base shadow-md shadow-[#8D43F4]/30">
                A
              </div>
              <span className="font-extrabold text-2xl tracking-tighter">ASTRA</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Transcendent street-couture and hyper-engineered footwear. Merging artisanal raw silk tailoring with aerodynamic kinetic physics.
            </p>
            <div className="text-xs font-mono text-muted-foreground">
              PARIS · TOKYO · NEW YORK · MILAN
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase text-accent font-semibold mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/shop?category=footwear" className="hover:text-foreground transition-colors">
                  Kinetic Sneakers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=apparel" className="hover:text-foreground transition-colors">
                  Raw Silk Hoodies
                </Link>
              </li>
              <li>
                <Link href="/shop?category=outerwear" className="hover:text-foreground transition-colors">
                  Monolith Trench Coats
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-foreground transition-colors">
                  Leather Crossbodies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase text-accent font-semibold mb-4">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/orders" className="hover:text-foreground transition-colors">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-foreground transition-colors">
                  Bag & Checkout
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-foreground transition-colors">
                  Private Wishlist
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  VIP FAQ & Sizing
                </a>
              </li>
            </ul>
          </div>

          {/* VIP Newsletter */}
          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase text-accent font-semibold mb-3">
              Private Drop Access
            </h4>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Receive private invitation codes for limited drop sneakers 48 hours prior to public release.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="vip@astra.luxury"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-xs bg-background"
                required
              />
              <Button type="submit" variant="violet" size="sm" className="w-full font-semibold">
                Join Runway Club
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 ASTRA COUTURE & FOOTWEAR. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer">NFC Verification</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
