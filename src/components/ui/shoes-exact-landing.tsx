"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Zap, Feather, ShieldCheck, Compass, Flame, Layers, RefreshCw, ShoppingBag, Star, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export function ShoesExactLanding() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const shoeDemos = [
    {
      id: "demo-1",
      name: "X-1 Carbon Kinetic Runner",
      category: "Aerospace Speed Series",
      price: "$285",
      badge: "Podium 1st",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=900&auto=format&fit=crop",
      desc: "Full-length 3K dual curved carbon-fiber propulsion plate with supercritical nitro-foam.",
    },
    {
      id: "demo-2",
      name: "Cyber High-Top Street Couture",
      category: "Runway Limited Drop",
      price: "$340",
      badge: "Exclusive",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=900&auto=format&fit=crop",
      desc: "Italian full-grain nubuck leather, titanium quick-lacing hardware, and Vibram lugged soles.",
    },
    {
      id: "demo-3",
      name: "Lunar Horizon 3.0 All-Terrain",
      category: "Gore-Tex Mountain Trek",
      price: "$295",
      badge: "Waterproof",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=900&auto=format&fit=crop",
      desc: "Triple-layer waterproof ballistic mesh with multidirectional geometric traction lugs.",
    },
    {
      id: "demo-4",
      name: "Minimalist Studio Low Trainer",
      category: "Monochrome Daily",
      price: "$230",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=900&auto=format&fit=crop",
      desc: "Ultra-clean silhouette crafted from vegetable-tanned leather and ergonomic molded insole.",
    },
    {
      id: "demo-5",
      name: "Lunar Recovery Slide 2.0",
      category: "Post-Run Recovery",
      price: "$120",
      badge: "Plush Foam",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=900&auto=format&fit=crop",
      desc: "Dual-density adaptive memory compound engineered to relieve plantar arch pressure.",
    },
    {
      id: "demo-6",
      name: "Retro Futurism 1988 High-Top",
      category: "Archive Heritage",
      price: "$310",
      badge: "Collector",
      image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=900&auto=format&fit=crop",
      desc: "Vintage basketball proportion re-engineered with aerospace carbon-composite shank.",
    },
    {
      id: "demo-7",
      name: "Trail Predator Vibram Trek",
      category: "Technical Footwear",
      price: "$275",
      badge: "Vibram Sole",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=900&auto=format&fit=crop",
      desc: "Megagrip compound rubber outer sole designed for extreme wet rock and technical descents.",
    },
    {
      id: "demo-8",
      name: "Runway Concept 3D Prototype",
      category: "Generative Lattice",
      price: "$450",
      badge: "3D Printed",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=900&auto=format&fit=crop",
      desc: "Elastomeric polyurethane 3D-printed lattice midsole tailored to individual foot strikes.",
    },
    {
      id: "demo-9",
      name: "Hyper-Lite Marathon 180g",
      category: "Ultra Racing",
      price: "$290",
      badge: "180 Grams",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=900&auto=format&fit=crop",
      desc: "Single-layer translucent woven monofilament mesh with bonded seamless toe guards.",
    },
    {
      id: "demo-10",
      name: "Urban Stealth Waterproof Boot",
      category: "Tactical Streetwear",
      price: "$360",
      badge: "Cordura 1000D",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=900&auto=format&fit=crop",
      desc: "Abrasion-resistant Cordura ballistic nylon upper with quick-release Fidlock magnetic buckles.",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Dual Carbon Plate",
      desc: "Aerospace propulsion efficiency.",
    },
    {
      icon: Flame,
      title: "Nitro-Foam Cushion",
      desc: "Supercritical gas rebound.",
    },
    {
      icon: Compass,
      title: "Vibram Megagrip",
      desc: "All-terrain multidirectional lugs.",
    },
    {
      icon: ShieldCheck,
      title: "Gore-Tex Shield",
      desc: "100% waterproof breathability.",
    },
    {
      icon: Layers,
      title: "Italian Nubuck",
      desc: "Handcrafted luxury leather.",
    },
    {
      icon: Feather,
      title: "180g Featherweight",
      desc: "Zero redundant weight.",
    },
    {
      icon: RefreshCw,
      title: "Circular Polymers",
      desc: "70% recycled ocean plastics.",
    },
  ];

  const handleOrder = (name: string) => {
    toast.success("Drop Reserved!", {
      description: `${name} has been added to your checkout bag.`,
    });
  };

  return (
    <div className="w-full bg-[#F6F4EE] dark:bg-[#0E0E10] text-[#111111] dark:text-white font-sans transition-colors duration-300">
      {/* 1. HERO BANNER (Matching the exact structure and style of user's uploaded image) */}
      <section className="banner-section relative w-full pt-32 pb-20 sm:pt-40 sm:pb-28 text-center overflow-hidden">
        {/* Decorative Floating Curl / Shape */}
        <div className="absolute top-28 right-12 w-28 h-28 hidden lg:block opacity-60 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#FF5E14]">
            <path
              d="M10 80 Q 45 10, 80 40 T 90 90"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Centered Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15] mb-6">
            ASTRA - Kinetic Luxury &amp; <br />
            <span className="relative inline-block">
              <span className="text-foreground">Footwear</span>
              {/* Orange Brush Stroke Underline */}
              <svg
                className="absolute -bottom-2 sm:-bottom-3 left-0 w-full text-[#FF5E14] overflow-visible pointer-events-none"
                viewBox="0 0 300 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 13C70 4 230 4 297 11"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            Collection
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            Pioneering aerospace carbon propulsion soles, supercritical nitrogen foam cushioning, and high-fashion luxury footwear.
          </p>
        </div>

        {/* Horizontal Sliding Shoe Mockup Showcase Strip (Matching image showcase strip in screenshot) */}
        <div className="relative w-full overflow-x-auto no-scrollbar py-6">
          <div className="flex items-center gap-6 px-4 sm:px-8 w-max mx-auto animate-marquee">
            {shoeDemos.slice(0, 6).map((shoe, idx) => (
              <div
                key={idx}
                className="relative h-48 w-72 sm:h-56 sm:w-80 rounded-2xl overflow-hidden bg-white dark:bg-[#18181D] border border-border shadow-xl p-4 flex flex-col justify-between flex-shrink-0 group hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/80 text-white text-[10px] font-mono font-bold">
                    {shoe.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#FF5E14]">
                    {shoe.price}
                  </span>
                </div>

                <div className="relative h-28 sm:h-36 w-full">
                  <Image
                    src={shoe.image}
                    alt={shoe.name}
                    fill
                    className="object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.25)]"
                    sizes="320px"
                  />
                </div>

                <div className="text-xs font-bold truncate text-foreground">
                  {shoe.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FUNFACT BAR (Matching the sleek black statistics bar from screenshot) */}
      <section className="funfact-section bg-[#070709] text-white py-14 border-y border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center items-center divide-y sm:divide-y-0 sm:divide-x divide-neutral-800">
            {/* Stat 1 */}
            <div className="space-y-1 py-2 sm:py-0">
              <div className="text-4xl sm:text-5xl font-black font-mono text-[#FF5E14]">
                10
              </div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300">
                Exclusive Shoe Drops
              </p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1 py-2 sm:py-0">
              <div className="text-2xl sm:text-3xl font-black text-[#FF5E14] tracking-tight">
                Light &amp; Dark
              </div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300">
                Edition For All Silhouettes
              </p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1 py-2 sm:py-0">
              <div className="text-4xl sm:text-5xl font-black font-mono text-[#FF5E14]">
                40+
              </div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-300">
                Global Colorways
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 10 PRE-MADE UNIQUE & STUNNING SHOE DROPS (Matching 10-card grid from screenshot) */}
      <section id="demos" className="demo-section py-24 sm:py-32 bg-[#F6F4EE] dark:bg-[#0E0E10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF5E14] mb-2 block">
              COLLECTION 2026
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              10 Pre-Made Unique <br />
              <span className="relative inline-block">
                &amp; Stunning Drops
                {/* Orange Brush Stroke */}
                <svg
                  className="absolute -bottom-2 left-0 w-full text-[#FF5E14] overflow-visible pointer-events-none"
                  viewBox="0 0 260 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 11C60 3 200 3 257 9"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </div>

          {/* 10 Card Grid (3 columns on desktop matching user's image) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {shoeDemos.map((shoe) => (
              <div
                key={shoe.id}
                className="group rounded-3xl bg-white dark:bg-[#18181D] border border-border/80 hover:border-[#FF5E14] shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between p-4 sm:p-5"
              >
                {/* Image Window */}
                <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 p-6 flex items-center justify-center overflow-hidden">
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 text-white text-[10px] font-mono font-bold tracking-wider z-10">
                    {shoe.badge}
                  </span>

                  <span className="absolute top-3 right-3 text-xs font-mono font-black text-[#FF5E14] z-10">
                    {shoe.price}
                  </span>

                  <div className="relative h-48 w-full transition-transform duration-500 group-hover:scale-110">
                    <Image
                      src={shoe.image}
                      alt={shoe.name}
                      fill
                      className="object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </div>

                {/* Card Title & Info */}
                <div className="pt-5 pb-2 text-center">
                  <h3 className="text-lg font-black text-foreground group-hover:text-[#FF5E14] transition-colors">
                    {shoe.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {shoe.desc}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleOrder(shoe.name)}
                  className="w-full mt-2 py-3 rounded-full bg-muted hover:bg-[#FF5E14] text-foreground hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Quick Reserve
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PERFORMANCE & SPEED METRICS (Matching performence section) */}
      <section className="performence-section py-20 bg-card/60 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground mb-12">
            Fast Response &amp; <span className="text-[#FF5E14]">Super Smooth Kinetic Glide.</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-background border border-border shadow-sm">
              <div className="text-4xl sm:text-5xl font-black font-mono text-[#FF5E14] mb-2">5.00</div>
              <div className="flex justify-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs font-mono font-bold uppercase text-muted-foreground">Global Wearer Rating</p>
            </div>

            <div className="p-8 rounded-3xl bg-background border border-border shadow-sm">
              <div className="text-4xl sm:text-5xl font-black font-mono text-[#FF5E14] mb-2">98%</div>
              <p className="text-xs font-mono font-bold uppercase text-muted-foreground">Energy Return Ratio</p>
            </div>

            <div className="p-8 rounded-3xl bg-background border border-border shadow-sm">
              <div className="text-4xl sm:text-5xl font-black font-mono text-[#FF5E14] mb-2">96%</div>
              <p className="text-xs font-mono font-bold uppercase text-muted-foreground">Carbon Durability Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE FEATURES (Matching circular icon badges from screenshot) */}
      <section id="featured" className="feature-section py-24 sm:py-32 bg-[#F6F4EE] dark:bg-[#0E0E10] border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Section Title */}
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mb-16">
            Core <span className="relative inline-block">
              Features
              <svg
                className="absolute -bottom-2 left-0 w-full text-[#FF5E14] overflow-visible pointer-events-none"
                viewBox="0 0 160 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 9C40 2 120 2 158 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>

          {/* Circular Badge Icons Grid (Matching the exact round white bubbles in screenshot) */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center space-y-3 group cursor-pointer w-32 sm:w-36"
                >
                  {/* Circular White Bubble with Shadow */}
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white dark:bg-[#18181D] border border-border shadow-lg group-hover:scale-110 group-hover:border-[#FF5E14] group-hover:shadow-xl transition-all duration-300">
                    <Icon className="h-8 w-8 sm:h-9 sm:w-9 text-[#FF5E14]" />
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-foreground text-center leading-tight">
                    {feat.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER (Matching Create your Personal Portfolio Website Now! in screenshot) */}
      <section className="main-footer py-24 bg-[#F6F4EE] dark:bg-[#0E0E10] border-t border-border text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF5E14] text-white font-black text-xl shadow-lg shadow-[#FF5E14]/30">
              A
            </div>
            <span className="font-black text-2xl tracking-widest uppercase font-sans text-foreground">
              ASTRA
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight">
            Reserve Your Kinetic Luxury <br />
            Footwear Silhouette Now!
          </h2>

          <div className="pt-4">
            <a
              href="#demos"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#FF5E14] hover:bg-[#FF5E14]/90 text-white font-mono text-sm font-bold uppercase tracking-wider shadow-xl shadow-[#FF5E14]/30 hover:scale-105 transition-all duration-300"
            >
              Shop Current Drop <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShoesExactLanding;
