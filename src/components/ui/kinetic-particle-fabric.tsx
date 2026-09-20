"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface PhysicsNode {
  curr: Vector3;
  prev: Vector3;
  base: Vector3;
  proj: { x: number; y: number; scale: number; alpha: number };
  pinned: boolean;
  excitation: number;
}

interface StructuralConstraint {
  p1: number;
  p2: number;
  length: number;
}

export interface KineticFabricProps {
  className?: string;
  isBackground?: boolean;
}

export function KineticFabric({
  className = "",
  isBackground = true,
}: KineticFabricProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isVisibleRef = useRef(true);

  const pointerRef = useRef({
    x: -2000,
    y: -2000,
    prevX: -2000,
    prevY: -2000,
    vx: 0,
    vy: 0,
    targetAngleX: 0.12,
    targetAngleY: 0.0,
    angleX: 0.12,
    angleY: 0.0,
    radius: 200,
    isDown: false,
    shockwaves: [] as { x: number; y: number; radius: number; maxRadius: number; strength: number }[],
  });

  const nodesRef = useRef<PhysicsNode[]>([]);
  const linksRef = useRef<StructuralConstraint[]>([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const buildMesh = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    if (width === 0 || height === 0) return;

    const spacing = 42;
    const cols = Math.ceil((width * 1.15) / spacing) + 1;
    const rows = Math.ceil((height * 1.15) / spacing) + 1;

    const nodes: PhysicsNode[] = [];
    const links: StructuralConstraint[] = [];
    const grid: number[][] = [];

    const startX = -(cols * spacing) / 2;
    const startY = -(rows * spacing) / 2;

    let index = 0;
    for (let j = 0; j < rows; j++) {
      grid[j] = [];
      for (let i = 0; i < cols; i++) {
        const bx = startX + i * spacing;
        const by = startY + j * spacing;
        const bz = 0;

        const isPinned = i === 0 || i === cols - 1 || j === 0 || j === rows - 1;

        nodes.push({
          curr: { x: bx, y: by, z: bz },
          prev: { x: bx, y: by, z: bz },
          base: { x: bx, y: by, z: bz },
          proj: { x: 0, y: 0, scale: 1, alpha: 1 },
          pinned: isPinned,
          excitation: 0,
        });

        grid[j][i] = index++;
      }
    }

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const currIdx = grid[j][i];

        if (i < cols - 1) {
          links.push({ p1: currIdx, p2: grid[j][i + 1], length: spacing });
        }
        if (j < rows - 1) {
          links.push({ p1: currIdx, p2: grid[j + 1][i], length: spacing });
        }
      }
    }

    nodesRef.current = nodes;
    linksRef.current = links;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        if (rect.width === 0 || rect.height === 0) continue;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        dimensionsRef.current = { width: rect.width, height: rect.height };
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        buildMesh();
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [buildMesh]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId = 0;
    let time = 0;

    const loop = () => {
      if (!isVisibleRef.current) {
        animId = requestAnimationFrame(loop);
        return;
      }

      time += 0.016;
      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const nodes = nodesRef.current;
      const links = linksRef.current;
      const pointer = pointerRef.current;

      pointer.vx = (pointer.x - pointer.prevX) * 0.3;
      pointer.vy = (pointer.y - pointer.prevY) * 0.3;
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;

      const pointerSpeed = Math.min(Math.sqrt(pointer.vx * pointer.vx + pointer.vy * pointer.vy), 30);

      pointer.angleX += (pointer.targetAngleX - pointer.angleX) * 0.05;
      pointer.angleY += (pointer.targetAngleY - pointer.angleY) * 0.05;

      const cosX = Math.cos(pointer.angleX);
      const sinX = Math.sin(pointer.angleX);
      const cosY = Math.cos(pointer.angleY);
      const sinY = Math.sin(pointer.angleY);

      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "#08080a" : "#faf9fc";

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Shockwaves update
      for (let s = pointer.shockwaves.length - 1; s >= 0; s--) {
        const sw = pointer.shockwaves[s];
        sw.radius += 14;
        sw.strength *= 0.93;
        if (sw.radius > sw.maxRadius || sw.strength < 0.01) {
          pointer.shockwaves.splice(s, 1);
        }
      }

      // Physics integration
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.pinned) continue;

        const vx = (n.curr.x - n.prev.x) * 0.95;
        const vy = (n.curr.y - n.prev.y) * 0.95;
        const vz = (n.curr.z - n.prev.z) * 0.95;

        n.prev.x = n.curr.x;
        n.prev.y = n.curr.y;
        n.prev.z = n.curr.z;

        n.curr.x += vx;
        n.curr.y += vy;
        n.curr.z += vz;

        const fluidZ = Math.sin(n.base.x * 0.007 + time) * 16 + Math.cos(n.base.y * 0.009 + time * 1.1) * 12;

        n.curr.x += (n.base.x - n.curr.x) * 0.035;
        n.curr.y += (n.base.y - n.curr.y) * 0.035;
        n.curr.z += (n.base.z + fluidZ - n.curr.z) * 0.035;

        n.excitation *= 0.92;
      }

      const fov = 650;
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        const rx1 = n.curr.x * cosY + n.curr.z * sinY;
        const ry1 = n.curr.y;
        const rz1 = -n.curr.x * sinY + n.curr.z * cosY;

        const rx2 = rx1;
        const ry2 = ry1 * cosX - rz1 * sinX;
        const rz2 = ry1 * sinX + rz1 * cosX + 460;

        const scale = fov / Math.max(1, rz2);
        n.proj.x = cx + rx2 * scale;
        n.proj.y = cy + ry2 * scale;
        n.proj.scale = scale;
        n.proj.alpha = Math.min(1, Math.max(0.1, (scale - 0.45) * 1.4));

        if (!n.pinned) {
          const dx = n.proj.x - pointer.x;
          const dy = n.proj.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < pointer.radius && dist > 0) {
            const ratio = 1 - dist / pointer.radius;
            const force = ratio * (pointer.isDown ? 38 : 20) + pointerSpeed * 0.35;
            const angle = Math.atan2(dy, dx);

            n.curr.x += (Math.cos(angle) * force * 0.75) / n.proj.scale;
            n.curr.y += (Math.sin(angle) * force * 0.75) / n.proj.scale;
            n.curr.z -= (force * 2.5) / n.proj.scale;
            n.excitation = Math.max(n.excitation, ratio);
          }

          for (let s = 0; s < pointer.shockwaves.length; s++) {
            const sw = pointer.shockwaves[s];
            const swDx = n.proj.x - sw.x;
            const swDy = n.proj.y - sw.y;
            const swDist = Math.sqrt(swDx * swDx + swDy * swDy);
            const ringDelta = Math.abs(swDist - sw.radius);

            if (ringDelta < 40) {
              const impulse = (1 - ringDelta / 40) * sw.strength * 24;
              n.curr.z += impulse / n.proj.scale;
              n.excitation = Math.max(n.excitation, 0.75);
            }
          }
        }
      }

      // Relaxation pass
      for (let p = 0; p < 2; p++) {
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const na = nodes[link.p1];
          const nb = nodes[link.p2];

          const dx = nb.curr.x - na.curr.x;
          const dy = nb.curr.y - na.curr.y;
          const dz = nb.curr.z - na.curr.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const diff = (dist - link.length) / (dist || 1);

          if (!na.pinned) {
            na.curr.x += dx * 0.5 * diff;
            na.curr.y += dy * 0.5 * diff;
            na.curr.z += dz * 0.5 * diff;
          }
          if (!nb.pinned) {
            nb.curr.x -= dx * 0.5 * diff;
            nb.curr.y -= dy * 0.5 * diff;
            nb.curr.z -= dz * 0.5 * diff;
          }
        }
      }

      // Draw links
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const na = nodes[link.p1];
        const nb = nodes[link.p2];

        const avgScale = (na.proj.scale + nb.proj.scale) / 2;
        const isExcited = na.excitation > 0.1 || nb.excitation > 0.1;

        if (isExcited) {
          const glow = Math.max(na.excitation, nb.excitation);
          ctx.strokeStyle = `rgba(168, 85, 247, ${Math.min(0.9, 0.45 + glow * 0.45)})`;
          ctx.lineWidth = (0.9 + glow * 1.3) * avgScale;
        } else {
          ctx.strokeStyle = isDark
            ? `rgba(255, 255, 255, ${0.07 * avgScale})`
            : `rgba(141, 67, 244, ${0.12 * avgScale})`;
          ctx.lineWidth = 0.65 * avgScale;
        }

        ctx.beginPath();
        ctx.moveTo(na.proj.x, na.proj.y);
        ctx.lineTo(nb.proj.x, nb.proj.y);
        ctx.stroke();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Global mouse tracking over container/parent
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= -50 && x <= rect.width + 50 && y >= -50 && y <= rect.height + 50) {
        pointerRef.current.x = x;
        pointerRef.current.y = y;

        const normX = (x / rect.width - 0.5) * 2;
        const normY = (y / rect.height - 0.5) * 2;
        pointerRef.current.targetAngleY = normX * 0.25;
        pointerRef.current.targetAngleX = -normY * 0.18 + 0.12;
      } else {
        pointerRef.current.x = -2000;
        pointerRef.current.y = -2000;
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        pointerRef.current.shockwaves.push({
          x,
          y,
          radius: 10,
          maxRadius: 400,
          strength: 1.0,
        });
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    window.addEventListener("click", handleGlobalClick, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full pointer-events-none"
      />
    </div>
  );
}

export default KineticFabric;

