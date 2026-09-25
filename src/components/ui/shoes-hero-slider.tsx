"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, Sparkles, ShoppingBag, Flame, ChevronRight } from "lucide-react";

export function ShoesHeroSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  const heroShoes = [
    {
      name: "ASTRA X-1 Carbon Kinetic",
      category: "Aerospace Speed Runner",
      tag: "Drop #01 • Exclusive",
      price: "$285",
      color: "Neon Coral / Obsidian",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop",
      description: "Infused with curved dual carbon-fiber propulsion plates and ultra-responsive kinetic nitrogen-foam cushioning.",
    },
    {
      name: "ASTRA High-Top Cyber Couture",
      category: "Streetwear Limited Edition",
      tag: "Drop #02 • Best Seller",
      price: "$340",
      color: "Chalk Pearl / Cyber Violet",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200&auto=format&fit=crop",
      description: "Handcrafted Italian full-grain nubuck leather with titanium quick-lace hardware and ergonomic Vibram soles.",
    },
    {
      name: "ASTRA Lunar Horizon 3.0",
      category: "Futuristic All-Terrain Trek",
      tag: "Drop #03 • New Arrival",
      price: "$295",
      color: "Solar Amber / Stealth Grey",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1200&auto=format&fit=crop",
      description: "Gore-Tex waterproof ballistic mesh upper with multi-directional geometric lugged grip for unstoppable traction.",
    },
  ];

  // Auto-slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroShoes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroShoes.length]);

  const current = heroShoes[activeSlide];

  return (
    <section className="banner-section relative w-full pt-32 pb-24 sm:pt-40 sm:pb-36 bg-background text-foreground overflow-hidden">
      {/* Background Ambience & Glow Shaders */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#FF5E14]/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[30rem] h-[30rem] rounded-full bg-amber-500/10 blur-[160px] pointer-events-none" />

      {/* Floating Animated Geometric Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating Shoe Thumbnails Background Gallery Layer (matching user markup) */}
      <ul className="image-layer absolute inset-0 pointer-events-none hidden xl:block opacity-25">
        <li className="absolute top-28 left-12 w-24 h-24 rounded-2xl overflow-hidden border border-border/60 shadow-lg -rotate-12 animate-pulse">
          <Image src={heroShoes[0].image} alt="" fill className="object-cover" />
        </li>
        <li className="absolute bottom-24 left-24 w-28 h-28 rounded-2xl overflow-hidden border border-border/60 shadow-lg rotate-6">
          <Image src={heroShoes[1].image} alt="" fill className="object-cover" />
        </li>
        <li className="absolute top-32 right-16 w-28 h-28 rounded-2xl overflow-hidden border border-border/60 shadow-lg rotate-12">
          <Image src={heroShoes[2].image} alt="" fill className="object-cover" />
        </li>
        <li className="absolute bottom-28 right-28 w-24 h-24 rounded-2xl overflow-hidden border border-border/60 shadow-lg -rotate-6 animate-pulse">
          <Image src={heroShoes[0].image} alt="" fill className="object-cover" />
        </li>
      </ul>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Live Drop Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs sm:text-sm font-mono font-bold uppercase tracking-wider shadow-sm">
              <Flame className="h-4 w-4 animate-bounce" /> {current.tag}
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.08]">
                Kinetic Luxury & <br />
                <span className="relative inline-block text-[#FF5E14]">
                  Street-Couture
                  {/* SVG Brush Stroke Underline */}
                  <svg
                    className="absolute -bottom-2 sm:-bottom-3 left-0 w-full text-[#FF5E14] overflow-visible pointer-events-none"
                    viewBox="0 0 300 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 13C70 4 230 4 297 11"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                Footwear.
              </h1>
            </div>

            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              {current.description}
            </p>

            {/* Price & Action Group */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-foreground">
                  {current.price}
                </span>
                <span className="text-xs font-mono text-muted-foreground uppercase">
                  USD • Free Express Shipping
                </span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="#collection"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF5E14] hover:bg-[#FF5E14]/90 text-white text-xs sm:text-sm font-bold font-mono uppercase tracking-wider shadow-xl shadow-[#FF5E14]/30 hover:scale-105 transition-all duration-300"
                >
                  <ShoppingBag className="h-4 w-4" /> Shop Current Drop
                </a>

                <a
                  href="#technology"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-card hover:bg-muted text-foreground border border-border text-xs sm:text-sm font-bold font-mono uppercase tracking-wider shadow-sm transition-all duration-300"
                >
                  Specs <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-4">
              {heroShoes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeSlide === idx
                      ? "w-8 bg-[#FF5E14]"
                      : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Featured Sneaker Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative h-[400px] sm:h-[500px] w-full rounded-[40px] overflow-hidden bg-gradient-to-br from-card via-card to-[#FF5E14]/10 border border-border shadow-2xl p-6 flex flex-col justify-between">
                {/* Top Badge */}
                <div className="flex items-center justify-between z-10">
                  <span className="px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-mono font-semibold border border-white/20">
                    {current.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#FF5E14]">
                    {current.color}
                  </span>
                </div>

                {/* Main Sneaker Image with Floating Transition */}
                <div className="relative h-64 sm:h-72 w-full my-auto transition-transform duration-700 hover:scale-110">
                  <Image
                    src={current.image}
                    alt={current.name}
                    fill
                    className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>

                {/* Bottom Product Info Glass Bar */}
                <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-between z-10">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold truncate">
                      {current.name}
                    </h4>
                    <span className="text-xs font-mono text-[#FF5E14]">
                      Sizes US 7 - 14 Available
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-black text-white">
                      {current.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShoesHeroSlider;
