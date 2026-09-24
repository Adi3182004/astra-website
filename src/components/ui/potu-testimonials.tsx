"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PotuTestimonials() {
  const [currentIdx, setCurrentIdx] = useState(0);

  const testimonials = [
    {
      quote:
        "Jon is an extraordinary product designer who completely revolutionized our SaaS user interface. Our onboarding drop-off decreased by 42% within three weeks of launch!",
      author: "Marcus Sterling",
      role: "VP of Product, Apex Global",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
      companyLogo: "APEX",
    },
    {
      quote:
        "The brand identity and 3D web experience created for our footwear drop exceeded every expectation. The aesthetics are state-of-the-art and our community loved it.",
      author: "Elena Rostova",
      role: "Creative Director, Zenith Footwear",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop",
      companyLogo: "ZENITH",
    },
    {
      quote:
        "Working with Potu studio was smooth, communicative, and fast. The Next.js web application was delivered ahead of schedule with unmatched attention to detail.",
      author: "Alexander Vance",
      role: "Founder & CEO, Novus Capital",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
      companyLogo: "NOVUS",
    },
  ];

  const nextTestimonial = () => {
    setCurrentIdx((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative w-full py-24 sm:py-32 bg-[#111114] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Title Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider">
              <span>✦</span> TESTIMONIALS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              What Global <br />
              <span className="text-[#FF5E14]">Clients Say.</span>
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Real feedback from industry leaders and founders who trusted our design and engineering capabilities.
            </p>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={prevTestimonial}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 hover:bg-[#FF5E14] hover:border-[#FF5E14] text-white transition-all duration-300 shadow-md"
                title="Previous"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextTestimonial}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 hover:bg-[#FF5E14] hover:border-[#FF5E14] text-white transition-all duration-300 shadow-md"
                title="Next"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Right Card Column */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="relative p-8 sm:p-12 rounded-[36px] bg-[#18181D] border border-neutral-800 shadow-2xl space-y-8"
              >
                {/* Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5E14]/15 text-[#FF5E14]">
                    <Quote className="h-7 w-7" />
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(testimonials[currentIdx].rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Quote Text */}
                <p className="text-lg sm:text-2xl text-neutral-200 font-medium leading-relaxed">
                  "{testimonials[currentIdx].quote}"
                </p>

                {/* Author Info */}
                <div className="pt-6 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-[#FF5E14]">
                      <Image
                        src={testimonials[currentIdx].avatar}
                        alt={testimonials[currentIdx].author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-white">
                        {testimonials[currentIdx].author}
                      </h4>
                      <p className="text-xs font-mono text-neutral-400">
                        {testimonials[currentIdx].role}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-extrabold tracking-widest text-[#FF5E14] px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800">
                    {testimonials[currentIdx].companyLogo}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PotuTestimonials;
