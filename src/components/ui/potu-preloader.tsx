"use client";

import React, { useEffect, useState } from "react";

export function PotuPreloader() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !loading) return null;

  return (
    <div
      suppressHydrationWarning
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#070709] select-none text-white transition-opacity duration-700"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Glowing Minimalist Circular Spinner Ring (as shown in image) */}
        <div className="relative mb-10 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center">
          <svg className="h-full w-full animate-spin" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#333339"
              strokeWidth="3.5"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeDasharray="276"
              strokeDashoffset="120"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Sharp White Outline & Fill Animated Typography (as shown in user images) */}
        <div className="flex items-center gap-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-[0.25em] uppercase font-sans">
          <span className="relative inline-block animate-pulse text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            A
          </span>
          <span className="relative inline-block animate-pulse [animation-delay:150ms] text-white/90">
            S
          </span>
          <span className="relative inline-block animate-pulse [animation-delay:300ms] text-white/90">
            T
          </span>
          <span className="relative inline-block animate-pulse [animation-delay:450ms] text-white">
            R
          </span>
          <span className="relative inline-block animate-pulse [animation-delay:600ms] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            A
          </span>
        </div>

        <p className="mt-6 font-mono text-xs tracking-[0.3em] uppercase text-neutral-400">
          KINETIC FOOTWEAR & STREET COUTURE
        </p>
      </div>
    </div>
  );
}

export default PotuPreloader;
