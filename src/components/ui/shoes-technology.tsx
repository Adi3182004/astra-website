"use client";

import React from "react";
import Image from "next/image";
import { Cpu, ShieldCheck, Zap, Wind, Layers, Sparkles } from "lucide-react";

export function ShoesTechnology() {
  const specs = [
    { label: "Carbon-Fiber Propulsion Efficiency", percent: "98%", desc: "Full-length aerospace 3K carbon plate converts downward force into forward thrust." },
    { label: "Nitro-Foam Kinetic Shock Absorption", percent: "96%", desc: "Infused with supercritical nitrogen gas for 85% energy return with every stride." },
    { label: "Vibram Megagrip All-Terrain Traction", percent: "95%", desc: "Geometric multidirectional rubber lugs adapt instantly to wet tarmac and steep mountain trails." },
    { label: "Aerodynamic Micro-Weave Airflow", percent: "94%", desc: "Ultralight breathable monofilament mesh maintains optimal foot temperature." },
    { label: "Orthopedic Ergonomic Arch Support", percent: "92%", desc: "Dual-density molded EVA insole engineered in collaboration with world-class podiatrists." },
  ];

  const innovations = [
    {
      icon: Zap,
      title: "Dual Carbon Propulsion",
      desc: "Curved biomechanical plate geometry designed to reduce calf fatigue by up to 14% on endurance runs.",
    },
    {
      icon: Wind,
      title: "180g Featherweight Chassis",
      desc: "Every redundant gram eliminated through generative design algorithms and bonded seamless seams.",
    },
    {
      icon: ShieldCheck,
      title: "Gore-Tex Ballistic Shield",
      desc: "Triple-layer membrane provides 100% waterproof protection while expelling interior humidity.",
    },
    {
      icon: Layers,
      title: "Circular Eco-Polymers",
      desc: "Upper constructed with 70% ocean-bound recycled plastic and algae-based midsole compounds.",
    },
  ];

  return (
    <section id="technology" className="relative w-full py-24 sm:py-32 bg-card/60 border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Cpu className="h-3.5 w-3.5" /> MATERIAL SCIENCE & R&D
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            Kinetic Footwear <br />
            <span className="text-[#FF5E14]">Engineering Specs.</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Where aerospace-grade composites meet ergonomic biomechanics to create the fastest, most comfortable luxury footwear on earth.
          </p>
        </div>

        {/* 2 Column Layout: Percentage Metrics & Innovation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Animated Progress Bars */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-2xl font-black tracking-tight mb-8">
              Laboratory Performance Ratings
            </h3>

            {specs.map((item, idx) => (
              <div key={idx} className="space-y-2 p-5 rounded-2xl bg-background border border-border">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-foreground">{item.label}</span>
                  <span className="font-mono text-base font-black text-[#FF5E14]">{item.percent}</span>
                </div>

                {/* Progress Bar Line */}
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#FF5E14] transition-all duration-1000"
                    style={{ width: item.percent }}
                  />
                </div>

                <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: 4 Innovation Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {innovations.map((inn, idx) => {
              const Icon = inn.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-[32px] bg-background border border-border hover:border-[#FF5E14] transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF5E14]/15 text-[#FF5E14] mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black tracking-tight mb-2">
                      {inn.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {inn.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShoesTechnology;
