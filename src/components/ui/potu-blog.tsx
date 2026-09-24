"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Calendar, Clock, Sparkles } from "lucide-react";

export function PotuBlog() {
  const articles = [
    {
      title: "How to Architect Enterprise Design Systems in Figma & Next.js",
      category: "Product Architecture",
      date: "September 18, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop",
      excerpt: "Step-by-step strategies for tokenization, component governance, and syncing Figma variables with Tailwind CSS.",
    },
    {
      title: "The Psychology of Bold Color & Micro-Interactions in Fintech UX",
      category: "Design Strategy",
      date: "August 29, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
      excerpt: "Why high-contrast palettes and tactile haptic feedback drive 38% higher user engagement in financial applications.",
    },
    {
      title: "Mastering Real-Time 3D WebGL Shaders Without Sacrificing Page Speed",
      category: "Creative Engineering",
      date: "August 12, 2026",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
      excerpt: "Optimizing WebGL draw calls, offscreen rendering, and viewport auto-pausing for smooth 60FPS animations on mobile.",
    },
  ];

  return (
    <section id="blog" className="relative w-full py-24 sm:py-32 bg-card/60 border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" /> INSIGHTS & EDITORIAL
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              Latest <span className="text-[#FF5E14]">Articles.</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground text-sm sm:text-base leading-relaxed">
            Thoughts on product design, frontend engineering, 3D interactive graphics, and digital brand scalability.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art, idx) => (
            <article
              key={idx}
              className="group cursor-pointer rounded-[32px] overflow-hidden bg-background border border-border hover:border-[#FF5E14] transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden bg-muted">
                  <Image
                    src={art.image}
                    alt={art.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-semibold border border-white/20">
                      {art.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#FF5E14]" /> {art.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#FF5E14]" /> {art.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-[#FF5E14] transition-colors line-clamp-2 mb-3">
                    {art.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5E14] group-hover:underline">
                  Read Article
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted group-hover:bg-[#FF5E14] group-hover:text-white transition-colors duration-300">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PotuBlog;
