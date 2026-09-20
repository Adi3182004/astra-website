import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FloatingImageProps {
  src: string;
  alt: string;
  className?: string;
  depth?: number;
}

const FloatingImage = ({ src, alt, className = "", depth = 1 }: FloatingImageProps) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = ((e.clientX - centerX) / centerX) * 20 * depth;
      const moveY = ((e.clientY - centerY) / centerY) * 15 * depth;
      setOffset({ x: moveX, y: moveY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [depth]);

  return (
    <motion.div
      ref={ref}
      className={`absolute ${className}`}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
    >
      <img
        src={src}
        alt={alt}
        className="rounded-3xl luxury-shadow object-cover"
        loading="lazy"
      />
    </motion.div>
  );
};

interface ParallaxHeroProps {
  images: { src: string; alt: string; className: string; depth: number; size: string }[];
  title: React.ReactNode;
  subtitle: string;
}

export const ParallaxHero = ({ images, title, subtitle }: ParallaxHeroProps) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {images.map((img, i) => (
        <FloatingImage
          key={i}
          src={img.src}
          alt={img.alt}
          className={`${img.className} ${img.size}`}
          depth={img.depth}
        />
      ))}
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {title}
        </motion.div>
        <motion.p
          className="max-w-md mx-auto text-muted-foreground uppercase tracking-[0.2em] text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
};
