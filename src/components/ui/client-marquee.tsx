"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function ClientMarquee() {
  const items = [
    "BRANDING & IDENTITY",
    "UI/UX DESIGN",
    "MOBILE APP DEVELOPMENT",
    "PRODUCT STRATEGY",
    "CREATIVE DIRECTION",
    "WEBFLOW DEVELOPMENT",
    "3D MOTION GRAPHICS",
    "DESIGN SYSTEMS",
  ];

  return (
    <div className="relative w-full overflow-hidden py-6 bg-[#111111] dark:bg-[#18181B] text-white border-y border-neutral-800 select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        <div className="flex items-center gap-8 text-sm sm:text-base font-extrabold uppercase tracking-widest px-4 font-sans">
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="hover:text-[#FF5E14] transition-colors cursor-default">{item}</span>
              <span className="text-[#FF5E14]">✦</span>
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center gap-8 text-sm sm:text-base font-extrabold uppercase tracking-widest px-4 font-sans" aria-hidden="true">
          {items.map((item, idx) => (
            <React.Fragment key={`dup-${idx}`}>
              <span className="hover:text-[#FF5E14] transition-colors cursor-default">{item}</span>
              <span className="text-[#FF5E14]">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClientMarquee;
