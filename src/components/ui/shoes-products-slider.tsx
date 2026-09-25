"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, ShoppingBag, Star, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";

export function ShoesProductsSlider() {
  const [activeTab, setActiveTab] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);

  const tabs = ["All", "Runners", "High-Tops", "All-Terrain", "Slides"];

  const products = [
    {
      id: "astra-x1",
      name: "ASTRA X-1 Carbon Kinetic",
      category: "Runners",
      price: "$285",
      rating: "4.9",
      reviews: "142",
      badge: "Podium Speed",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
      sizes: ["US 8", "US 9", "US 10", "US 11", "US 12"],
    },
    {
      id: "astra-high-top",
      name: "ASTRA High-Top Cyber Couture",
      category: "High-Tops",
      price: "$340",
      rating: "5.0",
      reviews: "98",
      badge: "Limited Drop",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
      sizes: ["US 7.5", "US 8.5", "US 9.5", "US 10.5", "US 11.5"],
    },
    {
      id: "astra-horizon",
      name: "ASTRA Lunar Horizon 3.0",
      category: "All-Terrain",
      price: "$295",
      rating: "4.8",
      reviews: "76",
      badge: "Gore-Tex",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop",
      sizes: ["US 8", "US 9", "US 10", "US 11", "US 13"],
    },
    {
      id: "astra-slides",
      name: "ASTRA Lunar Recovery Slides",
      category: "Slides",
      price: "$120",
      rating: "4.9",
      reviews: "210",
      badge: "Memory Foam",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop",
      sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
    },
    {
      id: "astra-studio",
      name: "ASTRA Minimalist Low Trainer",
      category: "Runners",
      price: "$230",
      rating: "4.9",
      reviews: "184",
      badge: "Studio Edition",
      image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop",
      sizes: ["US 8", "US 9", "US 10", "US 11", "US 12"],
    },
    {
      id: "astra-retro",
      name: "ASTRA Retro Futurism 1988",
      category: "High-Tops",
      price: "$310",
      rating: "5.0",
      reviews: "64",
      badge: "Collector",
      image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=800&auto=format&fit=crop",
      sizes: ["US 8.5", "US 9.5", "US 10.5", "US 12"],
    },
  ];

  const filtered = activeTab === "All" ? products : products.filter((p) => p.category === activeTab);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filtered.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };

  const handleAddToCart = (productName: string) => {
    toast.success("Added to Bag!", {
      description: `${productName} has been reserved in your cart.`,
    });
  };

  return (
    <section id="collection" className="relative w-full py-24 sm:py-32 bg-background text-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="h-3.5 w-3.5" /> OFFICIAL CATALOG
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              Featured <span className="text-[#FF5E14]">Shoe Drops.</span>
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-card border border-border shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentIndex(0);
                }}
                className={`px-5 py-2 rounded-full text-xs font-mono font-bold uppercase transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-[#FF5E14] text-white shadow-md shadow-[#FF5E14]/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-[36px] bg-card border border-border hover:border-[#FF5E14] transition-all duration-300 shadow-sm hover:shadow-2xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Product Image Area */}
                <div className="relative h-72 w-full bg-muted/40 p-6 flex items-center justify-center overflow-hidden">
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-semibold border border-white/15 z-10">
                    {item.badge}
                  </span>

                  <button
                    onClick={() => toast.success("Saved to Wishlist!")}
                    className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-md text-foreground hover:text-[#FF5E14] border border-border transition-colors z-10"
                    title="Wishlist"
                  >
                    <Heart className="h-4 w-4" />
                  </button>

                  <div className="relative h-56 w-full transition-transform duration-500 group-hover:scale-110">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.25)]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5E14]">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span className="font-bold text-foreground">{item.rating}</span>
                      <span className="text-muted-foreground">({item.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-[#FF5E14] transition-colors">
                    {item.name}
                  </h3>

                  {/* Size Selector Badges */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                    {item.sizes.map((sz, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-mono text-muted-foreground hover:bg-[#FF5E14] hover:text-white transition-colors cursor-pointer flex-shrink-0"
                      >
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-foreground">
                    {item.price}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(item.name)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF5E14] hover:bg-[#FF5E14]/90 text-white text-xs font-bold font-mono uppercase tracking-wider shadow-lg shadow-[#FF5E14]/30 hover:scale-105 transition-all duration-300"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShoesProductsSlider;
