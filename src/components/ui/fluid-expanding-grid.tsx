"use client";

import React, { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  link: string;
}

const DEFAULT_ITEMS: GalleryItem[] = [
  {
    id: "outerwear",
    title: "Outerwear",
    subtitle: "Tailored Monolith gabardine overcoats",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80",
    color: "#8D43F4",
    link: "/shop?category=outerwear",
  },
  {
    id: "footwear",
    title: "Footwear",
    subtitle: "Air Rev & carbon-fiber kinetic runners",
    image: "https://cdn.21st.dev/assets/mirror/b5/b53e247c16c9009c0c84b479f179878b30db90aa2b6c483b5317f9c3cc185ba1.png",
    color: "#4A90E2",
    link: "/shop?category=footwear",
  },
  {
    id: "apparel",
    title: "Heavyweight Silk",
    subtitle: "520 GSM raw silk infused hoodies & tees",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
    color: "#10b981",
    link: "/shop?category=apparel",
  },
];

interface FluidExpandingGridProps {
  items?: GalleryItem[];
  className?: string;
  id?: string;
}

export function FluidExpandingGrid({
  items = DEFAULT_ITEMS,
  className,
  id = "fluid-gallery",
}: FluidExpandingGridProps) {
  const [layout, setLayout] = useState(() => {
    const ids = items.map((item) => item.id);
    return {
      row1: ids.slice(0, 2),
      row2: ids.slice(2, Math.min(items.length, 4)),
    };
  });

  const handleExpand = (itemId: string) => {
    const inRow1 = layout.row1.includes(itemId);
    const inRow2 = layout.row2.includes(itemId);

    if (
      (inRow1 && layout.row1.length === 1) ||
      (inRow2 && layout.row2.length === 1)
    )
      return;

    if (inRow1) {
      const neighbor = layout.row1.find((i) => i !== itemId)!;
      setLayout({
        row1: [itemId],
        row2: [neighbor, ...layout.row2.filter((i) => i !== neighbor)].slice(0, 2),
      });
    } else {
      const neighbor = layout.row2.find((i) => i !== itemId)!;
      setLayout({
        row1: [neighbor, ...layout.row1.filter((i) => i !== neighbor)].slice(0, 2),
        row2: [itemId],
      });
    }
  };

  return (
    <div className={cn("w-full flex items-center justify-center overflow-hidden py-10 not-prose select-none", className)}>
      <div className="w-full max-w-4xl px-4">
        <LayoutGroup id={id}>
          <motion.div
            layout
            className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6 w-full h-[360px] sm:h-[520px]"
          >
            {items.map((item) => {
              const isRow1 = layout.row1.includes(item.id);
              const rowArr = isRow1 ? layout.row1 : layout.row2;
              const isSelected = rowArr.length === 1 && rowArr[0] === item.id;

              const gridRow = isRow1 ? 1 : 2;
              let gridColumn = "";
              if (isSelected) {
                gridColumn = "1 / span 2";
              } else {
                if (isRow1) {
                  gridColumn = layout.row1.indexOf(item.id) === 0 ? "1" : "2";
                } else {
                  gridColumn = layout.row2.indexOf(item.id) === 0 ? "1" : "2";
                }
              }

              return (
                <motion.div
                  key={item.id}
                  layoutId={`${id}-${item.id}`}
                  onClick={() => handleExpand(item.id)}
                  style={{ gridRow, gridColumn } as any}
                  className={cn(
                    "relative cursor-pointer group w-full h-full",
                    isSelected ? "z-30" : "z-10"
                  )}
                  transition={{
                    layout: {
                      type: "spring",
                      stiffness: 100,
                      damping: 25,
                    },
                  }}
                >
                  <motion.div
                    layoutId={`${id}-${item.id}-mask-wrapper`}
                    className="absolute inset-0 overflow-hidden bg-neutral-900 shadow-2xl"
                    style={{ borderRadius: 28 }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out",
                        isSelected ? "object-[center_40%] scale-105" : "object-[center_50%]"
                      )}
                    />
                    <motion.div
                      layoutId={`${id}-${item.id}-mask`}
                      className={cn(
                        "absolute inset-0 transition-colors duration-700",
                        isSelected ? "bg-black/20" : "bg-black/45"
                      )}
                    />
                  </motion.div>

                  <motion.div
                    layout="position"
                    className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white z-10 select-none"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
                        Collection
                      </span>
                      {isSelected && (
                        <Link
                          href={item.link}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all shadow-lg"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    <motion.div layout="position" className="overflow-hidden">
                      <motion.h3
                        layout="position"
                        className="text-2xl sm:text-4xl font-semibold mb-1 tracking-tight"
                      >
                        {item.title}
                      </motion.h3>
                      <motion.p
                        layout="position"
                        className="text-xs sm:text-sm text-white/85 font-normal"
                      >
                        {item.subtitle}
                      </motion.p>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    layoutId={`${id}-${item.id}-overlay`}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      borderRadius: 28,
                      background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                    }}
                  />
                  <motion.div
                    layoutId={`${id}-${item.id}-border`}
                    className="absolute inset-0 border border-white/10 group-hover:border-[#8D43F4]/50 transition-colors duration-500 pointer-events-none"
                    style={{ borderRadius: 28 }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </LayoutGroup>
      </div>
    </div>
  );
}

export default FluidExpandingGrid;
