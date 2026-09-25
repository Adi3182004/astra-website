"use client";

import React from "react";
import { Package, Globe, Award, Star } from "lucide-react";

export function ShoesFunfacts() {
  const stats = [
    { icon: Package, value: "120K+", label: "Drops Delivered Worldwide", sub: "100% On-Time Express Dispatch" },
    { icon: Award, value: "48+", label: "Design & Ergonomic Awards", sub: "Red Dot & ISPO Footwear Winners" },
    { icon: Star, value: "4.98", label: "Verified Buyer Rating", sub: "Over 35,000+ Five-Star Reviews" },
    { icon: Globe, value: "65+", label: "Global Flagship Stockists", sub: "Tokyo, Paris, London, New York" },
  ];

  return (
    <section className="relative w-full py-16 bg-background border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-[28px] bg-card border border-border text-center flex flex-col items-center justify-center space-y-3 shadow-sm hover:border-[#FF5E14] transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF5E14]/15 text-[#FF5E14]">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-foreground">
                  {st.value}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {st.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {st.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ShoesFunfacts;
