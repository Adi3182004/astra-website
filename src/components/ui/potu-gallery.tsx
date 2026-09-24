"use client";

import React from "react";
import Image from "next/image";
import { Instagram, ArrowUpRight, Heart, MessageSquare } from "lucide-react";

export function PotuGallery() {
  const feedItems = [
    {
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
      tag: "#KineticFootwear",
      likes: "1.4k",
    },
    {
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop",
      tag: "#MobileUI",
      likes: "982",
    },
    {
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
      tag: "#3DMotion",
      likes: "2.1k",
    },
    {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
      tag: "#EditorialBrand",
      likes: "1.8k",
    },
    {
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      tag: "#DesignSystem",
      likes: "3.2k",
    },
    {
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
      tag: "#FullStackCode",
      likes: "1.1k",
    },
  ];

  return (
    <section className="relative w-full py-20 bg-background text-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FF5E14] font-semibold mb-2">
              <Instagram className="h-4 w-4" /> @POTU.STUDIO
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Live Creative <span className="text-[#FF5E14]">Shots.</span>
            </h2>
          </div>
          <a
            href="https://dribbble.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-[#FF5E14] transition-colors"
          >
            Follow on Dribbble & Instagram <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* Grid of 6 Shots */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {feedItems.map((item, idx) => (
            <div
              key={idx}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-muted cursor-pointer shadow-sm"
            >
              <Image
                src={item.image}
                alt={item.tag}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white text-xs font-mono">
                <div className="flex justify-end">
                  <ArrowUpRight className="h-4 w-4 text-[#FF5E14]" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] mb-1">
                    <Heart className="h-3 w-3 fill-[#FF5E14] text-[#FF5E14]" /> {item.likes}
                  </div>
                  <div className="font-bold text-[10px] text-neutral-300 truncate">
                    {item.tag}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PotuGallery;
