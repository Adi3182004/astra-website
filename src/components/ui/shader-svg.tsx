"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function MeshGradientSVG() {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const targetOffset = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.08;
        const deltaY = (e.clientY - centerY) * 0.08;

        const maxOffset = 10;
        targetOffset.current = {
          x: Math.max(-maxOffset, Math.min(maxOffset, deltaX)),
          y: Math.max(-maxOffset, Math.min(maxOffset, deltaY)),
        };
      }
    };

    const updateLoop = () => {
      // Smooth lerp without React state stutter
      currentOffset.current.x += (targetOffset.current.x - currentOffset.current.x) * 0.25;
      currentOffset.current.y += (targetOffset.current.y - currentOffset.current.y) * 0.25;

      setEyeOffset({
        x: currentOffset.current.x,
        y: currentOffset.current.y,
      });

      animId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <motion.div
      className="relative w-full max-w-[240px] mx-auto p-4 flex flex-col items-center justify-center select-none"
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 3.2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width="210"
        height="260"
        viewBox="0 0 231 289"
        className="w-full h-auto drop-shadow-2xl"
      >
        <defs>
          <clipPath id="ghostShapeClip">
            <path d="M230.809 115.385V249.411C230.809 269.923 214.985 287.282 194.495 288.411C184.544 288.949 175.364 285.718 168.26 280C159.746 273.154 147.769 273.461 139.178 280.23C132.638 285.384 124.381 288.462 115.379 288.462C106.377 288.462 98.1451 285.384 91.6055 280.23C82.912 273.385 70.9353 273.385 62.2415 280.23C55.7532 285.334 47.598 288.411 38.7246 288.462C17.4132 288.615 0 270.667 0 249.359V115.385C0 51.6667 51.6756 0 115.404 0C179.134 0 230.809 51.6667 230.809 115.385Z" />
          </clipPath>

          <linearGradient id="ghostGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="35%" stopColor="#8D43F4" />
            <stop offset="70%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>

          <radialGradient id="ghostRadial" cx="60%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F472B6" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#8D43F4" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#1E1B4B" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Ghost Body */}
        <g clipPath="url(#ghostShapeClip)">
          <rect width="231" height="289" fill="url(#ghostRadial)" />
          <rect width="231" height="289" fill="url(#ghostGradient)" opacity="0.6" style={{ mixBlendMode: "overlay" }} />
        </g>

        {/* Real-time Dynamic Eyes */}
        <ellipse
          rx="18"
          ry="28"
          fill="#FFFFFF"
          cx={80 + eyeOffset.x}
          cy={120 + eyeOffset.y}
          className="transition-transform duration-75"
        />

        <ellipse
          rx="18"
          ry="28"
          fill="#FFFFFF"
          cx={152 + eyeOffset.x}
          cy={120 + eyeOffset.y}
          className="transition-transform duration-75"
        />
      </svg>
    </motion.div>
  );
}

export default MeshGradientSVG;
