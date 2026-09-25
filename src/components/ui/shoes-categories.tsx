"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function ShoesCategories() {
  const categories = [
    {
      title: "Carbon Kinetic Speed Runners",
      subtitle: "Aerospace Ergonomics",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
      count: "12 Models",
      accent: "from-red-500/20",
    },
    {
      title: "Cyber High-Top Streetwear",
      subtitle: "Italian Nubuck & Titanium",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
      count: "8 Editions",
      accent: "from-purple-500/20",
    },
    {
      title: "All-Terrain Horizon Treks",
      subtitle: "Waterproof Gore-Tex & Vibram",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop",
      count: "6 Silhouettes",
      accent: "from-amber-500/20",
    },
    {
      title: "Lunar Recovery Slides",
      subtitle: "Adaptive Memory Foam",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop",
      count: "5 Colorways",
      accent: "from-blue-500/20",
    },
    {
      title: "Minimalist Studio Trainers",
      subtitle: "Monochrome Low-Tops",
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop",
      count: "14 Drops",
      accent: "from-emerald-500/20",
    },
    {
      title: "Runway Concept Prototypes",
      subtitle: "3D Printed Soles & Shaders",
      image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=800&auto=format&fit=crop",
      count: "Rare Edition",
      accent: "from-orange-500/20",
    },
  ];

  return (
    <section id="categories" className="relative w-full py-24 sm:py-32 bg-card/60 border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" /> SILHOUETTES & DISCIPLINES
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              Curated <span className="text-[#FF5E14]">Shoe Categories.</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground text-sm sm:text-base leading-relaxed">
            From marathon podium speed shoes to high-fashion runway sneakers, explore precision-engineered silhouettes crafted for modern movement.
          </p>
        </div>

        {/* 6 Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="group relative h-80 sm:h-96 rounded-[32px] overflow-hidden bg-background border border-border hover:border-[#FF5E14] transition-all duration-500 shadow-sm hover:shadow-2xl cursor-pointer flex flex-col justify-between p-6 sm:p-8"
            >
              {/* Category Background Image */}
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Top Meta */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-semibold border border-white/20">
                  {cat.count}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 group-hover:bg-[#FF5E14] text-white backdrop-blur-md transition-all duration-300">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>

              {/* Bottom Info */}
              <div className="relative z-10 space-y-1.5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5E14]">
                  {cat.subtitle}
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-[#FF5E14] transition-colors">
                  {cat.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShoesCategories;
