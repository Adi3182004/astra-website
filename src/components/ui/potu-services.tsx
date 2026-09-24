"use client";

import React, { useState } from "react";
import { ArrowUpRight, Palette, Layout, Smartphone, Box, Layers, Code } from "lucide-react";

interface ServiceItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  icon: React.ElementType;
}

export function PotuServices() {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  const services: ServiceItem[] = [
    {
      number: "01",
      title: "UI/UX & Web Design",
      subtitle: "Intuitive Digital Interfaces",
      description:
        "Human-centered design systems, responsive web apps, and design thinking that elevates user retention and conversion rates.",
      tags: ["Design System", "Figma", "SaaS Interface", "Responsive Web"],
      icon: Layout,
    },
    {
      number: "02",
      title: "Branding & Visual Identity",
      subtitle: "Distinctive Creative Direction",
      description:
        "Crafting iconic brand stories, logo guidelines, typography pairings, and digital assets that stand out in crowded global markets.",
      tags: ["Brand Book", "Logo Design", "Styleguide", "Packaging"],
      icon: Palette,
    },
    {
      number: "03",
      title: "Mobile App Development",
      subtitle: "iOS & Android Experiences",
      description:
        "Next-generation cross-platform mobile experiences with fluid gestures, offline capabilities, and native performance.",
      tags: ["React Native", "iOS / Android", "Micro-Interactions", "App Store"],
      icon: Smartphone,
    },
    {
      number: "04",
      title: "3D & Motion Graphics",
      subtitle: "Interactive Kinetic Art",
      description:
        "Hyper-realistic 3D assets, Spline web shaders, interactive physics, and promotional kinetic video animations.",
      tags: ["Spline 3D", "Framer Motion", "WebGL", "Interactive Shaders"],
      icon: Box,
    },
    {
      number: "05",
      title: "Full-Stack Web Engineering",
      subtitle: "Modern Cloud Architecture",
      description:
        "Blazing-fast Next.js / React web applications built with TypeScript, Tailwind CSS, API integrations, and robust database layers.",
      tags: ["Next.js 15", "TypeScript", "Node.js", "REST APIs"],
      icon: Code,
    },
    {
      number: "06",
      title: "Product Strategy & CRO",
      subtitle: "Data-Driven Growth",
      description:
        "Actionable user journey mapping, high-converting funnel optimization, performance analytics, and A/B test setups.",
      tags: ["Growth Funnels", "A/B Testing", "User Journeys", "Analytics"],
      icon: Layers,
    },
  ];

  return (
    <section id="services" className="relative w-full py-24 sm:py-32 bg-[#111114] text-white overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF5E14]/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <span>✦</span> WHAT I DO BEST
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
              My Premium <span className="text-[#FF5E14]">Services.</span>
            </h2>
          </div>
          <p className="max-w-md text-neutral-400 text-sm sm:text-base leading-relaxed">
            I craft engaging digital products that merge artistic elegance with rigorous engineering to scale modern businesses.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            const isHovered = activeIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`group relative p-8 rounded-[32px] bg-[#18181D] border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isHovered
                    ? "border-[#FF5E14] shadow-2xl shadow-[#FF5E14]/10 -translate-y-1.5"
                    : "border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div>
                  {/* Top Bar with Number & Arrow */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-[#FF5E14] group-hover:bg-[#FF5E14] group-hover:text-white transition-colors duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-mono text-sm text-neutral-500 font-bold tracking-wider">
                        {srv.number}
                      </span>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-white group-hover:bg-[#FF5E14] group-hover:border-[#FF5E14] transition-all duration-300 group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 group-hover:text-[#FF5E14] transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs font-mono text-[#FF5E14] uppercase tracking-wider mb-4 font-semibold">
                    {srv.subtitle}
                  </p>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                    {srv.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-800/80">
                  {srv.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-full bg-neutral-900/90 text-neutral-300 text-[11px] font-mono border border-neutral-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PotuServices;
