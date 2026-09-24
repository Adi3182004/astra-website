"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectItem {
  id: string;
  title: string;
  category: "branding" | "uiux" | "mobile" | "3d";
  categoryLabel: string;
  image: string;
  year: string;
  client: string;
  description: string;
}

export function PotuPortfolioSlider() {
  const [filter, setFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);

  const projects: ProjectItem[] = [
    {
      id: "proj-1",
      title: "FinTech NeoBank Dashboard",
      category: "uiux",
      categoryLabel: "UI/UX & Web Design",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
      year: "2026",
      client: "Aura Capital Global",
      description: "Complete design system and financial analytics dashboard for next-gen high-net-worth investors.",
    },
    {
      id: "proj-2",
      title: "Zenith Kinetic Sneakers & E-Com",
      category: "branding",
      categoryLabel: "Branding & Direction",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop",
      year: "2026",
      client: "Zenith Footwear Paris",
      description: "Visual identity, 3D interactive shoe customizer, and omnichannel storefront packaging design.",
    },
    {
      id: "proj-3",
      title: "Lumina Smart Home iOS App",
      category: "mobile",
      categoryLabel: "Mobile Application",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop",
      year: "2025",
      client: "Lumina Automation",
      description: "Ambient lighting control and energy telemetry app with haptic feedback and dynamic widgets.",
    },
    {
      id: "proj-4",
      title: "Cosmic Kinetic 3D Experience",
      category: "3d",
      categoryLabel: "3D & Motion Art",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      year: "2025",
      client: "Metaverse Studios",
      description: "Real-time WebGL shader dynamics and generative visual particle effects for interactive runway shows.",
    },
    {
      id: "proj-5",
      title: "Atelier Haute Couture Brand Identity",
      category: "branding",
      categoryLabel: "Brand Strategy",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
      year: "2025",
      client: "Atelier Vance Milan",
      description: "Artisanal luxury identity, editorial lookbook photography art direction, and typography system.",
    },
    {
      id: "proj-6",
      title: "Krypton Web3 Crypto Wallet",
      category: "mobile",
      categoryLabel: "Mobile Experience",
      image: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?q=80&w=1200&auto=format&fit=crop",
      year: "2024",
      client: "Krypton Protocol",
      description: "Biometric multi-chain DeFi wallet with real-time portfolio rebalancing and frictionless token swaps.",
    },
  ];

  const filteredProjects = projects.filter(
    (p) => filter === "all" || p.category === filter
  );

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredProjects.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);
  };

  return (
    <section id="portfolio" className="relative w-full py-24 sm:py-32 bg-background text-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <span>✦</span> FEATURED PORTFOLIO
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              Selected <span className="text-[#FF5E14]">Works.</span>
            </h2>
          </div>

          {/* Filter Tabs & Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2 p-1.5 rounded-full bg-card border border-border shadow-sm">
              {[
                { id: "all", label: "All Projects" },
                { id: "uiux", label: "UI/UX" },
                { id: "branding", label: "Branding" },
                { id: "mobile", label: "Mobile" },
                { id: "3d", label: "3D Motion" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilter(tab.id);
                    setCurrentIndex(0);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold font-mono uppercase tracking-wider transition-all duration-300 ${
                    filter === tab.id
                      ? "bg-[#FF5E14] text-white shadow-md shadow-[#FF5E14]/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card hover:bg-[#FF5E14] hover:border-[#FF5E14] hover:text-white transition-all duration-300 shadow-sm"
                title="Previous Slide"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextSlide}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card hover:bg-[#FF5E14] hover:border-[#FF5E14] hover:text-white transition-all duration-300 shadow-sm"
                title="Next Slide"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Project Carousel Slider Card */}
        <div className="relative mb-16">
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 && (
              <motion.div
                key={filteredProjects[currentIndex].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-[36px] bg-card border border-border shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-0"
              >
                {/* Image Container */}
                <div className="relative lg:col-span-7 h-[340px] sm:h-[440px] lg:h-[520px] overflow-hidden">
                  <Image
                    src={filteredProjects[currentIndex].image}
                    alt={filteredProjects[currentIndex].title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                  
                  {/* Floating Tag */}
                  <div className="absolute top-6 left-6 z-10">
                    <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-mono font-semibold border border-white/20">
                      {filteredProjects[currentIndex].categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-card">
                  <div>
                    <div className="flex items-center justify-between font-mono text-xs text-muted-foreground mb-6">
                      <span>CLIENT: {filteredProjects[currentIndex].client}</span>
                      <span>YEAR: {filteredProjects[currentIndex].year}</span>
                    </div>

                    <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 group-hover:text-[#FF5E14] transition-colors">
                      {filteredProjects[currentIndex].title}
                    </h3>

                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
                      {filteredProjects[currentIndex].description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-border flex items-center justify-between">
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#FF5E14] hover:text-[#FF5E14]/80 transition-colors uppercase tracking-wider font-mono"
                    >
                      Request Case Study <ArrowUpRight className="h-4 w-4" />
                    </a>

                    <span className="font-mono text-xs text-muted-foreground font-semibold">
                      0{currentIndex + 1} / 0{filteredProjects.length}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Multi-Project Grid Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              onClick={() => setCurrentIndex(idx)}
              className="group cursor-pointer rounded-[28px] overflow-hidden bg-card border border-border hover:border-[#FF5E14] transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono border border-white/20">
                    {project.categoryLabel}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold tracking-tight text-foreground group-hover:text-[#FF5E14] transition-colors">
                    {project.title}
                  </h4>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted group-hover:bg-[#FF5E14] group-hover:text-white transition-colors duration-300">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {project.client} · {project.year}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PotuPortfolioSlider;
