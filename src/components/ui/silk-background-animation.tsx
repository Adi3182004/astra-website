"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SilkBackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let time = 0;
    let animId: number;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.offsetWidth * dpr);
      canvas.height = Math.floor(canvas.offsetHeight * dpr);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    const render = () => {
      time += 0.012;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Check dark/light mode
      const isDark = document.documentElement.classList.contains("dark");
      
      // Base Background Gradient
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      if (isDark) {
        baseGrad.addColorStop(0, "#08060c");
        baseGrad.addColorStop(0.5, "#13091f");
        baseGrad.addColorStop(1, "#08060c");
      } else {
        baseGrad.addColorStop(0, "#faf8fc");
        baseGrad.addColorStop(0.5, "#f3ecf9");
        baseGrad.addColorStop(1, "#f7f2fc");
      }
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Multi-Layered Luminous Neon Purple Fluid Silk Ribbons
      const ribbonCount = 5;
      for (let r = 0; r < ribbonCount; r++) {
        ctx.beginPath();
        const yOffset = height * 0.45 + (r - 2) * 55;
        const phase = time + r * 0.7;

        ctx.moveTo(-50, height);

        for (let x = -50; x <= width + 50; x += 30) {
          const wave1 = Math.sin(x * 0.0035 + phase) * 75;
          const wave2 = Math.cos(x * 0.006 - phase * 0.8) * 45;
          const wave3 = Math.sin(x * 0.0015 + time * 1.2) * 30;
          const y = yOffset + wave1 + wave2 + wave3;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width + 50, height);
        ctx.closePath();

        // Vibrant Neon Violet / Fuchsia Radial & Linear Glows
        const glowGrad = ctx.createLinearGradient(0, yOffset - 100, width, yOffset + 150);
        if (isDark) {
          glowGrad.addColorStop(0, `rgba(168, 85, 247, ${0.18 + r * 0.04})`);
          glowGrad.addColorStop(0.5, `rgba(141, 67, 244, ${0.28 + r * 0.05})`);
          glowGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
        } else {
          glowGrad.addColorStop(0, `rgba(168, 85, 247, ${0.12 + r * 0.03})`);
          glowGrad.addColorStop(0.5, `rgba(141, 67, 244, ${0.18 + r * 0.04})`);
          glowGrad.addColorStop(1, "rgba(230, 215, 250, 0)");
        }

        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      // Bright Central Aurora Radial Spot
      const radialAurora = ctx.createRadialGradient(
        width / 2,
        height * 0.48,
        0,
        width / 2,
        height * 0.48,
        width * 0.55
      );
      if (isDark) {
        radialAurora.addColorStop(0, "rgba(168, 85, 247, 0.35)");
        radialAurora.addColorStop(0.4, "rgba(141, 67, 244, 0.18)");
        radialAurora.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        radialAurora.addColorStop(0, "rgba(168, 85, 247, 0.22)");
        radialAurora.addColorStop(0.4, "rgba(141, 67, 244, 0.10)");
        radialAurora.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      ctx.fillStyle = radialAurora;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative min-h-[92vh] w-full overflow-hidden flex items-center justify-center select-none">
      {/* 60fps High-Performance Silk Waves Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />

      {/* Vertical Architectural Grid Lines Overlay (Matching Reference) */}
      <div className="grid-guides max-w-6xl mx-auto z-10" />

      {/* Hero Central Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 max-w-5xl mx-auto">
        {/* Top Runway Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/70 backdrop-blur-xl mb-8 shadow-sm transition-all hover:scale-105">
          <span className="h-2 w-2 rounded-full bg-[#8D43F4] animate-ping" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-foreground/80 font-semibold">
            ASTRA HAUTE COUTURE & FOOTWEAR · 2026 COLLECTION
          </span>
        </div>

        {/* Main Logo Title with Glowing Ambient Violet Reflection */}
        <h1
          className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-light tracking-[-0.05em] leading-none text-foreground select-none transition-all"
          style={{
            fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
            textShadow: "0 0 70px rgba(168, 85, 247, 0.35)",
          }}
        >
          ASTRA
        </h1>

        {/* Subtitle Strips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm md:text-base font-medium tracking-[0.25em] uppercase text-muted-foreground">
          <span className="hover:text-foreground transition-colors">FLOWING</span>
          <span className="text-accent">•</span>
          <span className="hover:text-foreground transition-colors">TEXTURE</span>
          <span className="text-accent">•</span>
          <span className="hover:text-foreground transition-colors">COUTURE</span>
          <span className="text-accent">•</span>
          <span className="hover:text-foreground transition-colors">FOOTWEAR</span>
        </div>

        <p className="mt-5 max-w-lg text-xs sm:text-sm text-muted-foreground font-normal leading-relaxed">
          Engineered hyper-aerodynamic sneakers & structured silhouettes woven with raw silk fibres.
        </p>

        {/* Action Button Group Matching Reference Image (Pill + Circular Arrow Icon) */}
        <div className="mt-10 flex items-center justify-center gap-2.5">
          <Link
            href="/shop"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#8D43F4] text-white font-semibold text-xs sm:text-sm hover:bg-[#7b34df] transition-all shadow-xl shadow-[#8D43F4]/25 hover:scale-105 active:scale-95"
          >
            <span>Explore Drops</span>
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center h-12 w-12 rounded-full bg-card border border-border text-foreground hover:bg-muted hover:text-accent transition-all shadow-md hover:scale-110 active:scale-95"
            title="Browse Full Collection"
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SilkBackgroundAnimation;
