"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Zap, Smartphone, Moon, Code, ShieldCheck, Sparkles } from "lucide-react";

export function PotuDemosShowcase() {
  const demos = [
    {
      title: "UI/UX Designer Home",
      tag: "Main Concept",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop",
      badge: "Popular",
    },
    {
      title: "Full-Stack Developer",
      tag: "Tech & Code",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
      badge: "Trending",
    },
    {
      title: "Creative Photographer v1",
      tag: "Visual Storytelling",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
      badge: "New",
    },
    {
      title: "Creative Agency & Studio",
      tag: "Team Showcase",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop",
      badge: "Pro",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Ultra-Fast 60FPS Performance",
      description: "Optimized Next.js 15 App Router architecture with zero client bloat.",
    },
    {
      icon: Moon,
      title: "Dark & Light Mode Engine",
      description: "Effortless one-click theme switcher with persistent local preferences.",
    },
    {
      icon: Smartphone,
      title: "100% Fluid Responsive",
      description: "Pixel-perfect rendering across iPhone, iPad, tablets, and 4K desktop screens.",
    },
    {
      icon: Code,
      title: "Clean Modular Components",
      description: "TypeScript and Tailwind CSS built with atomic design principles.",
    },
  ];

  return (
    <section id="demos" className="relative w-full py-24 sm:py-32 bg-background text-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" /> EXPLORE ALL VARIATIONS
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            Multi-Concept <span className="text-[#FF5E14]">Homepage Demos.</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Engineered for elite freelancers, digital agencies, photographers, and modern creative teams seeking an unfair competitive advantage.
          </p>
        </div>

        {/* Demos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-24">
          {demos.map((demo, idx) => (
            <div
              key={idx}
              className="group relative rounded-[32px] overflow-hidden bg-card border border-border hover:border-[#FF5E14] transition-all duration-500 shadow-md hover:shadow-2xl flex flex-col"
            >
              <div className="relative h-[320px] sm:h-[400px] w-full overflow-hidden bg-muted">
                <Image
                  src={demo.image}
                  alt={demo.title}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Floating Badge */}
                <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FF5E14] text-white text-[11px] font-mono font-bold uppercase shadow-md shadow-[#FF5E14]/30">
                    {demo.badge}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-mono border border-white/20">
                    {demo.tag}
                  </span>
                </div>

                {/* Hover Overlay Button */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF5E14] text-white text-xs font-mono font-bold uppercase tracking-wider shadow-xl shadow-[#FF5E14]/40 hover:scale-105 transition-transform duration-300"
                  >
                    View Live Preview <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex items-center justify-between bg-card">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-[#FF5E14] transition-colors">
                    {demo.title}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    Next.js App Router · TypeScript · Tailwind CSS
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-[#FF5E14] group-hover:text-white transition-all duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-border">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-[24px] bg-card border border-border shadow-sm flex flex-col justify-between"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF5E14]/15 text-[#FF5E14] mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base tracking-tight mb-2">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PotuDemosShowcase;
