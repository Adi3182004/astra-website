import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import ghostImg from "@/assets/ghost.png";

const containerVariants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as const
    }
  }
};

const numberVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5
  }),
  visible: {
    opacity: 0.8,
    x: 0,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96] as const
    }
  }
};

const ghostVariants = {
  hidden: { 
    scale: 0.8,
    opacity: 0,
    y: 15,
    rotate: -5
  },
  visible: { 
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96] as const
    }
  },
  hover: {
    scale: 1.12,
    y: -10,
    rotate: [0, -5, 5, -5, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      rotate: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  },
  floating: {
    y: [-6, 6],
    transition: {
      y: {
        duration: 2.2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  }
};

export default function NotFound() {
  const location = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF8F6] via-[#FFF1ED] to-[#FFF8F6] dark:from-background dark:via-card/60 dark:to-background px-4">
      <AnimatePresence mode="wait">
        <motion.div 
          className="text-center max-w-md mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* 4 👻 4 in Peach Priora Theme */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10">
            <motion.span 
              className="text-[84px] md:text-[120px] font-bold text-[#3E1622] dark:text-foreground font-serif select-none"
              variants={numberVariants}
              custom={-1}
            >
              4
            </motion.span>
            <motion.div
              variants={ghostVariants}
              whileHover="hover"
              animate={["visible", "floating"]}
              className="cursor-pointer"
            >
              <img
                src={ghostImg}
                alt="Ghost"
                width={120}
                height={120}
                className="w-[84px] h-[84px] md:w-[124px] md:h-[124px] object-contain select-none drop-shadow-md"
                style={{ filter: "hue-rotate(325deg) saturate(1.4) brightness(1.05)" }}
                draggable="false"
              />
            </motion.div>
            <motion.span 
              className="text-[84px] md:text-[120px] font-bold text-[#3E1622] dark:text-foreground font-serif select-none"
              variants={numberVariants}
              custom={1}
            >
              4
            </motion.span>
          </div>
          
          <motion.h1 
            className="text-3xl md:text-5xl font-serif font-bold text-[#3E1622] dark:text-foreground mb-4 select-none"
            variants={itemVariants}
          >
            Boo! Page missing!
          </motion.h1>
          
          <motion.p 
            className="text-base md:text-lg text-foreground/75 mb-8 md:mb-10 select-none"
            variants={itemVariants}
          >
            Whoops! This page must be a ghost - it&apos;s not here!
          </motion.p>

          {/* Primary CTA */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              transition: {
                duration: 0.3,
                ease: [0.43, 0.13, 0.23, 0.96]
              }
            }}
          >
            <Link 
              to="/"
              className="inline-block bg-[#2D1219] text-white hover:bg-black px-8 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 select-none"
            >
              Find shelter
            </Link>
          </motion.div>

          {/* Previous Page highlighted link without underline */}
          <motion.div 
            className="mt-10"
            variants={itemVariants}
          >
            <p className="text-sm text-foreground/70 select-none flex items-center justify-center gap-1.5 flex-wrap">
              <span>This page does not exist, go to</span>
              <button
                type="button"
                onClick={() => nav(-1)}
                className="bg-[#FDE2E4] dark:bg-[#4A1525] text-[#9E2A54] dark:text-[#F8B4C8] font-semibold px-2.5 py-0.5 rounded-md hover:bg-[#FCD2D6] dark:hover:bg-[#5E1B30] transition-colors cursor-pointer shadow-2xs"
              >
                Previous page
              </button>
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
