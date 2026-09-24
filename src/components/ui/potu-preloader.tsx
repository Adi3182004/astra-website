"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PotuPreloader() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !loading) return null;

  return (
    <div
      suppressHydrationWarning
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#F6F4EE] dark:bg-[#0E0E10] select-none"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Spinning accent ring */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-[#FF5E14]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF5E14] border-r-[#FF5E14] animate-spin" />
          <div className="h-4 w-4 rounded-full bg-[#FF5E14] animate-pulse" />
        </div>

        {/* Potu animated letters */}
        <div className="flex items-center gap-1 text-3xl sm:text-4xl font-black tracking-widest text-[#111111] dark:text-white uppercase font-sans">
          <span className="letters-loading" data-text-preloader="P">P</span>
          <span className="letters-loading" data-text-preloader="O">O</span>
          <span className="letters-loading" data-text-preloader="T">T</span>
          <span className="letters-loading" data-text-preloader="U">U</span>
        </div>

        <p className="mt-4 font-mono text-[11px] tracking-widest uppercase text-muted-foreground/80">
          Creative Portfolio & Agency
        </p>
      </div>
    </div>
  );
}

export default PotuPreloader;

