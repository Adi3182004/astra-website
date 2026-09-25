"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles, CheckCircle2 } from "lucide-react";

export function ShoesTestimonials() {
  const [currentIdx, setCurrentIdx] = useState(0);

  const reviews = [
    {
      name: "Marcus Sterling",
      role: "Marathon Athlete & Trainer",
      shoe: "ASTRA X-1 Carbon Kinetic",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      quote: "The dual carbon plate response is unlike any racing shoe I have tested in my 12-year professional career. Shaved 2 minutes off my half-marathon PB without knee discomfort.",
      rating: 5,
      date: "Verified Runner • September 2026",
    },
    {
      name: "Elena Rostova",
      role: "High-Fashion Stylist (Milan)",
      shoe: "ASTRA High-Top Cyber Couture",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      quote: "ASTRA managed to merge futuristic cyberpunk street aesthetic with immaculate Italian nubuck craftsmanship. They turn heads on every runway in Milan and Paris.",
      rating: 5,
      date: "Verified Stylist • August 2026",
    },
    {
      name: "Kenji Takahashi",
      role: "Sneaker Curator (Tokyo)",
      shoe: "ASTRA Retro Futurism 1988",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      quote: "The attention to silhouette balance, lightweight aerospace compounds, and packaging detail is phenomenal. A true grail piece in modern footwear design.",
      rating: 5,
      date: "Verified Collector • August 2026",
    },
  ];

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const active = reviews[currentIdx];

  return (
    <section id="reviews" className="relative w-full py-24 sm:py-32 bg-card/60 border-t border-border overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" /> VERIFIED ENDORSEMENTS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            What <span className="text-[#FF5E14]">Wearers Say.</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Real feedback from professional marathoners, street stylists, and sneakerheads worldwide.
          </p>
        </div>

        {/* Big Testimonial Card */}
        <div className="relative rounded-[40px] bg-background border border-border p-8 sm:p-14 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-12">
            {/* Avatar & Badge */}
            <div className="flex flex-col items-center flex-shrink-0 space-y-3">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 border-[#FF5E14] shadow-xl">
                <Image src={active.avatar} alt={active.name} fill className="object-cover" />
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-500 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified Purchase
              </div>
            </div>

            {/* Quote Content */}
            <div className="space-y-6 text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
                {[...Array(active.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>

              <blockquote className="text-xl sm:text-2xl font-bold leading-relaxed text-foreground">
                "{active.quote}"
              </blockquote>

              <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-black text-foreground">{active.name}</h4>
                  <p className="text-xs font-mono text-[#FF5E14]">{active.role} • {active.shoe}</p>
                </div>

                {/* Slider Controls */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-muted hover:bg-[#FF5E14] hover:text-white transition-colors duration-300"
                    title="Previous Review"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF5E14] text-white hover:bg-[#FF5E14]/90 shadow-md shadow-[#FF5E14]/30 transition-colors duration-300"
                    title="Next Review"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShoesTestimonials;
