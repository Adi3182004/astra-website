"use client";

import React from "react";
import { Zap, ShieldCheck, Flame, Compass, Feather, RefreshCw, Layers, Sparkles } from "lucide-react";

export function ShoesFeatures() {
  const features = [
    { icon: Zap, title: "Curved Dual Carbon Plate", desc: "Energy return with explosive propulsion." },
    { icon: Feather, title: "180g Ultra-Lightweight", desc: "Chassis engineered for zero excess weight." },
    { icon: ShieldCheck, title: "Waterproof Gore-Tex", desc: "Total weather protection in all terrains." },
    { icon: Compass, title: "Vibram Megagrip Sole", desc: "Multi-directional all-surface traction." },
    { icon: Flame, title: "Supercritical Nitro-Foam", desc: "Plush impact dampening and rebound." },
    { icon: Layers, title: "Italian Nubuck Leather", desc: "Hand-stitched premium craftsmanship." },
    { icon: RefreshCw, title: "Circular Sustainable Design", desc: "Crafted with 70% recycled ocean polymers." },
  ];

  return (
    <section id="features" className="relative w-full py-24 sm:py-32 bg-background border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" /> INNOVATION PILLARS
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            Core <span className="text-[#FF5E14]">Shoe Features.</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Every millimeter of ASTRA footwear is built from rigorous laboratory testing and luxury artisanal craftsmanship.
          </p>
        </div>

        {/* 7 Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-[28px] bg-card border border-border hover:border-[#FF5E14] transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF5E14]/15 text-[#FF5E14] group-hover:scale-110 transition-transform duration-300 mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold tracking-tight mb-2 text-foreground group-hover:text-[#FF5E14] transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.desc}
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

export default ShoesFeatures;
