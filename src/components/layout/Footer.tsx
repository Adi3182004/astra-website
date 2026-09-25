"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight, Instagram, Twitter, Youtube, Send } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed to VIP Drop Alerts!", {
      description: "You will receive early access passwords 1 hour before general release.",
    });
    setEmail("");
  };

  return (
    <footer id="contact" className="relative w-full bg-[#0A0A0D] text-white border-t border-neutral-800 pt-20 pb-12 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF5E14]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-neutral-800">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF5E14] text-white shadow-lg shadow-[#FF5E14]/30">
                <span className="font-black text-xl tracking-tighter">A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-widest uppercase font-sans text-white">
                  ASTRA
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#FF5E14] font-bold -mt-1">
                  KINETIC FOOTWEAR
                </span>
              </div>
            </Link>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              Pioneering hyper-ergonomic carbon footwear, aerospace cushioning polymers, and limited street-couture silhouettes.
            </p>

            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Youtube, href: "https://youtube.com" },
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <a
                    key={idx}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 hover:bg-[#FF5E14] hover:border-[#FF5E14] text-neutral-300 hover:text-white transition-all duration-300"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF5E14]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-neutral-400">
              <li><a href="#collection" className="hover:text-white transition-colors">Carbon Speed Runners</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">High-Top Cyber Couture</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Lunar Recovery Slides</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">All-Terrain Treks</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Archive Drops</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF5E14]">
              Assistance
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-neutral-400">
              <li><a href="#faq" className="hover:text-white transition-colors">Sizing & Millimeter Guide</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Worldwide Shipping</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Plate Lifetime Warranty</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Store Locator</a></li>
            </ul>
          </div>

          {/* VIP Drop Newsletter */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF5E14]">
              VIP Drop Access
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Get secret drop passwords, limited colorway allocations, and invite-only runway previews.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center gap-2 p-1.5 rounded-full bg-neutral-900 border border-neutral-800 focus-within:border-[#FF5E14] transition-colors">
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent px-4 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5E14] hover:bg-[#FF5E14]/90 text-white transition-colors flex-shrink-0"
                  title="Subscribe"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <div>
            © {new Date().getFullYear()} ASTRA Footwear Lab Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Patents & R&D</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
