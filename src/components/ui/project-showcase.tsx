"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface DropProject {
  title: string;
  description: string;
  year: string;
  link: string;
  image: string;
  tag: string;
}

const ASTRA_DROPS: DropProject[] = [
  {
    title: "Astra Air Rev Aero",
    description: "High-top basketball silhouette with kinetic suspension sole and memory foam lining.",
    year: "2026",
    link: "/shop?category=footwear",
    image: "https://cdn.21st.dev/assets/mirror/b5/b53e247c16c9009c0c84b479f179878b30db90aa2b6c483b5317f9c3cc185ba1.png",
    tag: "Footwear",
  },
  {
    title: "Heavyweight Raw Silk Milled Hoodie",
    description: "520 GSM organic french terry with woven mulberry silk threads and storm hood.",
    year: "2026",
    link: "/shop?category=apparel",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
    tag: "Apparel",
  },
  {
    title: "Monolith Waterproof Trench Coat",
    description: "Architectural structured silhouette with magnetic storm flap fastening.",
    year: "2025",
    link: "/shop?category=outerwear",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80",
    tag: "Outerwear",
  },
  {
    title: "Titan Italian Calfskin Boots",
    description: "Full-grain calfskin high-top sneaker boot fused with a geometric Vibram sawtooth sole.",
    year: "2025",
    link: "/shop?category=footwear",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80",
    tag: "Footwear",
  },
];

export function ProjectShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIsVisible(false);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-4xl mx-auto px-6 py-20"
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-accent text-xs font-mono font-semibold tracking-widest uppercase">
            Curated Archive
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mt-1">
            Selected Drops & Footwear
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-xs font-mono tracking-wider uppercase text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors"
        >
          <span>View All Products</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Floating Image Preview */}
      <div
        className="pointer-events-none fixed z-50 overflow-hidden rounded-2xl shadow-2xl border border-white/20"
        style={{
          left: containerRef.current?.getBoundingClientRect().left ?? 0,
          top: containerRef.current?.getBoundingClientRect().top ?? 0,
          transform: `translate3d(${smoothPosition.x + 24}px, ${smoothPosition.y - 110}px, 0)`,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.85,
          transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="relative w-[300px] h-[190px] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
          {ASTRA_DROPS.map((drop, index) => (
            <img
              key={drop.title}
              src={drop.image || "/placeholder.svg"}
              alt={drop.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out"
              style={{
                opacity: hoveredIndex === index ? 1 : 0,
                scale: hoveredIndex === index ? 1 : 1.1,
                filter: hoveredIndex === index ? "none" : "blur(10px)",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      </div>

      {/* Interactive List */}
      <div className="space-y-0">
        {ASTRA_DROPS.map((drop, index) => (
          <Link
            key={drop.title}
            href={drop.link}
            className="group block"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative py-7 border-t border-border transition-all duration-300 ease-out">
              {/* Background highlight on hover */}
              <div
                className={`
                  absolute inset-0 -mx-4 px-4 bg-accent/10 rounded-2xl
                  transition-all duration-300 ease-out
                  ${hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                `}
              />

              <div className="relative flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-3">
                    <span className="text-[11px] font-mono text-accent uppercase tracking-wider px-2 py-0.5 rounded bg-accent/10">
                      {drop.tag}
                    </span>
                    <h3 className="text-foreground font-semibold text-xl tracking-tight">
                      <span className="relative">
                        {drop.title}
                        <span
                          className={`
                            absolute left-0 -bottom-1 h-[2px] bg-accent
                            transition-all duration-300 ease-out
                            ${hoveredIndex === index ? "w-full" : "w-0"}
                          `}
                        />
                      </span>
                    </h3>

                    <ArrowUpRight
                      className={`
                        w-5 h-5 text-accent
                        transition-all duration-300 ease-out
                        ${
                          hoveredIndex === index
                            ? "opacity-100 translate-x-0 translate-y-0"
                            : "opacity-0 -translate-x-2 translate-y-2"
                        }
                      `}
                    />
                  </div>

                  <p
                    className={`
                      text-muted-foreground text-sm mt-2 leading-relaxed max-w-2xl
                      transition-all duration-300 ease-out
                      ${hoveredIndex === index ? "text-foreground" : "text-muted-foreground"}
                    `}
                  >
                    {drop.description}
                  </p>
                </div>

                <span
                  className={`
                    text-xs font-mono text-muted-foreground tabular-nums self-center
                    transition-all duration-300 ease-out
                    ${hoveredIndex === index ? "text-accent font-semibold scale-110" : ""}
                  `}
                >
                  {drop.year}
                </span>
              </div>
            </div>
          </Link>
        ))}

        <div className="border-t border-border" />
      </div>
    </section>
  );
}

export default ProjectShowcase;
