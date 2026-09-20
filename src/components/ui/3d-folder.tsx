"use client";

import React, { useState, useRef, useLayoutEffect, useCallback, useEffect, forwardRef } from "react";
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LookbookItem {
  id: string;
  image: string;
  title: string;
  category?: string;
}

export interface AnimatedFolderProps {
  title: string;
  projects: LookbookItem[];
  className?: string;
}

export function AnimatedFolder({ title, projects, className }: AnimatedFolderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
  const [hiddenCardId, setHiddenCardId] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleProjectClick = (project: LookbookItem, index: number) => {
    const cardEl = cardRefs.current[index];
    if (cardEl) {
      setSourceRect(cardEl.getBoundingClientRect());
    }
    setSelectedIndex(index);
    setHiddenCardId(project.id);
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
    setSourceRect(null);
  };

  const handleCloseComplete = () => {
    setHiddenCardId(null);
  };

  const handleNavigate = (newIndex: number) => {
    setSelectedIndex(newIndex);
    setHiddenCardId(projects[newIndex]?.id || null);
  };

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center",
          "p-8 rounded-3xl cursor-pointer select-none",
          "bg-card/70 backdrop-blur-xl border border-border/80",
          "transition-all duration-500 ease-out",
          "hover:shadow-2xl hover:shadow-[#8D43F4]/15 hover:border-accent/40",
          "group",
          className
        )}
        style={{
          minWidth: "290px",
          minHeight: "340px",
          perspective: "1000px",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle background glow on hover */}
        <div
          className="absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 70%, #8D43F4 0%, transparent 70%)",
            opacity: isHovered ? 0.12 : 0,
          }}
        />

        <div className="relative flex items-center justify-center mb-4" style={{ height: "160px", width: "220px" }}>
          {/* Folder back layer */}
          <div
            className="absolute w-36 h-28 bg-neutral-300 dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-400/30 dark:border-neutral-700/50"
            style={{
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(-15deg)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 10,
            }}
          />

          {/* Folder tab */}
          <div
            className="absolute w-14 h-5 bg-neutral-400 dark:bg-neutral-700 rounded-t-lg"
            style={{
              top: "calc(50% - 56px - 14px)",
              left: "calc(50% - 72px + 18px)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(-25deg) translateY(-2px)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 10,
            }}
          />

          {/* Project cards - between back and front */}
          <div
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
            }}
          >
            {projects.slice(0, 3).map((project, index) => (
              <ProjectCard
                key={project.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                image={project.image}
                title={project.title}
                delay={index * 80}
                isVisible={isHovered}
                index={index}
                onClick={() => handleProjectClick(project, index)}
                isSelected={hiddenCardId === project.id}
              />
            ))}
          </div>

          {/* Folder front layer */}
          <div
            className="absolute w-36 h-28 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-900 rounded-xl shadow-xl border border-white/20"
            style={{
              top: "calc(50% - 56px + 6px)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(25deg) translateY(10px)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 30,
            }}
          />

          {/* Folder shine effect */}
          <div
            className="absolute w-36 h-28 rounded-xl overflow-hidden pointer-events-none"
            style={{
              top: "calc(50% - 56px + 6px)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(25deg) translateY(10px)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 31,
            }}
          />
        </div>

        {/* Folder title */}
        <h3
          className="text-lg font-semibold text-foreground mt-4 transition-all duration-300"
          style={{
            transform: isHovered ? "translateY(4px)" : "translateY(0)",
          }}
        >
          {title}
        </h3>

        {/* Project count */}
        <p
          className="text-xs text-muted-foreground transition-all duration-300 mt-0.5"
          style={{
            opacity: isHovered ? 0.7 : 1,
          }}
        >
          {projects.length} curated drops
        </p>

        {/* Hover hint */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-muted-foreground transition-all duration-300"
          style={{
            opacity: isHovered ? 0 : 0.6,
            transform: isHovered ? "translateY(10px)" : "translateY(0)",
          }}
        >
          <span>Hover to explore</span>
        </div>
      </div>

      <ImageLightbox
        projects={projects.slice(0, 3)}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={handleCloseLightbox}
        sourceRect={sourceRect}
        onCloseComplete={handleCloseComplete}
        onNavigate={handleNavigate}
      />
    </>
  );
}

interface ImageLightboxProps {
  projects: LookbookItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  sourceRect: DOMRect | null;
  onCloseComplete?: () => void;
  onNavigate: (index: number) => void;
}

export function ImageLightbox({
  projects,
  currentIndex,
  isOpen,
  onClose,
  sourceRect,
  onCloseComplete,
  onNavigate,
}: ImageLightboxProps) {
  const [animationPhase, setAnimationPhase] = useState<"initial" | "animating" | "complete">("initial");
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const [isSliding, setIsSliding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalProjects = projects.length;
  const hasNext = internalIndex < totalProjects - 1;
  const hasPrev = internalIndex > 0;

  const currentProject = projects[internalIndex];

  useEffect(() => {
    if (isOpen && currentIndex !== internalIndex && !isSliding) {
      setPrevIndex(internalIndex);
      setIsSliding(true);

      const timer = setTimeout(() => {
        setInternalIndex(currentIndex);
        setIsSliding(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, isOpen, internalIndex, isSliding]);

  useEffect(() => {
    if (isOpen) {
      setInternalIndex(currentIndex);
      setPrevIndex(currentIndex);
      setIsSliding(false);
    }
  }, [isOpen, currentIndex]);

  const navigateNext = useCallback(() => {
    if (internalIndex >= totalProjects - 1 || isSliding) return;
    onNavigate(internalIndex + 1);
  }, [internalIndex, totalProjects, isSliding, onNavigate]);

  const navigatePrev = useCallback(() => {
    if (internalIndex <= 0 || isSliding) return;
    onNavigate(internalIndex - 1);
  }, [internalIndex, isSliding, onNavigate]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    onClose();
    setTimeout(() => {
      setIsClosing(false);
      setShouldRender(false);
      setAnimationPhase("initial");
      onCloseComplete?.();
    }, 400);
  }, [onClose, onCloseComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") navigateNext();
      if (e.key === "ArrowLeft") navigatePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose, navigateNext, navigatePrev]);

  useLayoutEffect(() => {
    if (isOpen && sourceRect) {
      setShouldRender(true);
      setAnimationPhase("initial");
      setIsClosing(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationPhase("animating");
        });
      });
      const timer = setTimeout(() => {
        setAnimationPhase("complete");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, sourceRect]);

  const handleDotClick = (idx: number) => {
    if (isSliding || idx === internalIndex) return;
    onNavigate(idx);
  };

  if (!shouldRender || !currentProject) return null;

  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8")}
      onClick={handleClose}
      style={{
        opacity: isClosing ? 0 : 1,
        transition: "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
        style={{
          opacity: animationPhase === "initial" && !isClosing ? 0 : 1,
          transition: "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className={cn(
          "absolute top-6 right-6 z-50",
          "w-11 h-11 flex items-center justify-center",
          "rounded-full bg-card/80 backdrop-blur-md",
          "border border-border shadow-xl",
          "text-muted-foreground hover:text-foreground hover:bg-card",
          "transition-all duration-300 ease-out hover:scale-105 active:scale-95"
        )}
      >
        <X className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Prev / Next buttons */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigatePrev();
        }}
        disabled={!hasPrev || isSliding}
        className={cn(
          "absolute left-4 md:left-8 z-50",
          "w-12 h-12 flex items-center justify-center",
          "rounded-full bg-card/80 backdrop-blur-md",
          "border border-border shadow-xl",
          "text-muted-foreground hover:text-foreground hover:bg-card",
          "transition-all duration-300 ease-out hover:scale-110 active:scale-95",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
      >
        <ChevronLeft className="w-6 h-6" strokeWidth={2} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          navigateNext();
        }}
        disabled={!hasNext || isSliding}
        className={cn(
          "absolute right-4 md:right-8 z-50",
          "w-12 h-12 flex items-center justify-center",
          "rounded-full bg-card/80 backdrop-blur-md",
          "border border-border shadow-xl",
          "text-muted-foreground hover:text-foreground hover:bg-card",
          "transition-all duration-300 ease-out hover:scale-110 active:scale-95",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
      >
        <ChevronRight className="w-6 h-6" strokeWidth={2} />
      </button>

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-2xl">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${internalIndex * 100}%)`,
              }}
            >
              {projects.map((project) => (
                <div key={project.id} className="w-full flex-shrink-0 flex items-center justify-center bg-black/40 min-h-[50vh] max-h-[70vh]">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-5 bg-card border-t border-border flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{currentProject?.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">ASTRA Runway Edition · 2026 Collection</p>
            </div>

            <div className="flex items-center gap-2">
              {projects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    idx === internalIndex ? "bg-accent scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  image: string;
  title: string;
  delay: number;
  isVisible: boolean;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}

export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ image, title, delay, isVisible, index, onClick, isSelected }, ref) => {
    const rotations = [-14, 0, 14];
    const translations = [-60, 0, 60];

    return (
      <div
        ref={ref}
        className={cn(
          "absolute w-24 h-32 rounded-xl overflow-hidden shadow-2xl",
          "bg-card border border-border/80",
          "cursor-pointer hover:ring-2 hover:ring-accent/70",
          isSelected && "opacity-0"
        )}
        style={{
          transform: isVisible
            ? `translateY(-95px) translateX(${translations[index]}px) rotate(${rotations[index]}deg) scale(1)`
            : "translateY(0px) translateX(0px) rotate(0deg) scale(0.5)",
          opacity: isSelected ? 0 : isVisible ? 1 : 0,
          transition: `all 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
          zIndex: 10 - index,
          left: "-48px",
          top: "-64px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <p className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold text-white truncate">
          {title}
        </p>
      </div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

export default AnimatedFolder;
