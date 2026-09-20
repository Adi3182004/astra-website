import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LensProps {
  children: React.ReactElement<{ src?: string }>;
  zoomFactor?: number;
  lensSize?: number;
}

export const Lens = ({ children, zoomFactor = 2, lensSize = 150 }: LensProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              backgroundPosition: `${position.x}% ${position.y}%`,
              backgroundImage: `url(${children.props.src})`,
              backgroundSize: `${zoomFactor * 100}%`,
              maskImage: `radial-gradient(circle ${lensSize / 2}px at ${position.x}% ${position.y}%, black 100%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle ${lensSize / 2}px at ${position.x}% ${position.y}%, black 100%, transparent 100%)`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
