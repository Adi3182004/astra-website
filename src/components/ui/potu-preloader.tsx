"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PotuPreloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#F5F3EE] dark:bg-[#0E0E10] select-none"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PotuPreloader;
