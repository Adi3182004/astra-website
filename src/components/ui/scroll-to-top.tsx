"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalHeight > 0) {
        const progress = (currentScroll / totalHeight) * 100;
        setScrollProgress(progress);
      }

      // Hide when on top, show when scrolled down > 120px
      if (currentScroll > 120) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Circumference of circle with r=49 is 2 * PI * 49 ≈ 307.876
  const radius = 49;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      onClick={scrollToTop}
      title="Scroll to Top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-card/90 shadow-2xl backdrop-blur-md transition-all duration-400 hover:scale-110 active:scale-95 ${
        isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      {/* SVG Circular Progress Ring */}
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="-1 -1 102 102"
        fill="none"
      >
        {/* Background track circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted/40"
        />
        {/* Active progress stroke */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#FF5E14"
          strokeWidth="4.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-150"
        />
      </svg>

      {/* Upward Chevron Arrow in Orange */}
      <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5E14] stroke-[3] transition-transform duration-300 group-hover:-translate-y-0.5" />
    </div>
  );
}

export default ScrollToTop;
