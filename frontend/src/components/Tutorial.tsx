import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HelpCircle, ChevronLeft, ChevronRight, X, MousePointerClick } from "lucide-react";
import { TUTORIALS } from "@/lib/tutorials";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

/**
 * Duolingo-style interactive tutorial: it spotlights the exact control it is
 * talking about, blurs and dims everything else, moves the coach card next to
 * the control, and (when the step asks for it) waits for the admin to actually
 * click that control before moving on. Admin-only — never on the storefront.
 *
 * Accessibility: the coach card is a real modal dialog, is focused on open,
 * traps Tab, announces each step through an aria-live region and supports
 * arrow-key / Enter / Escape navigation.
 *
 * Performance: the spotlight rectangle is tracked with scroll/resize listeners
 * plus a ResizeObserver (no permanent requestAnimationFrame loop), and the
 * overlay animates with a short tween instead of a spring.
 */
export function TutorialButton({ id, className }: { id: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const tut = TUTORIALS[id];
  if (!tut) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Tutorial: ${tut.title}`}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-accent hover:bg-accent/20 transition",
          className,
        )}
      >
        <HelpCircle size={13} /> Tutorial
      </button>
      {open && <TutorialRunner id={id} onClose={() => setOpen(false)} />}
    </>
  );
}

const same = (a: Rect | null, b: Rect | null) =>
  (!a && !b) ||
  (!!a && !!b &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5);

const CARD_W = 360;
const CARD_H = 250;

function TutorialRunner({ id, onClose }: { id: string; onClose: () => void }) {
  const tut = TUTORIALS[id];
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [done, setDone] = useState(false);
  const rectRef = useRef<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<Element | null>(null);
  const reduce = useReducedMotion();
  const s = tut.steps[step];
  const last = step === tut.steps.length - 1;
  const needsClick = s.action === "click";

  const measure = useCallback(() => {
    const el = s.target ? document.querySelector(s.target) : null;
    let next: Rect | null = null;
    if (el) {
      const r = el.getBoundingClientRect();
      next = { top: r.top, left: r.left, width: r.width, height: r.height };
    }
    if (!same(next, rectRef.current)) {
      rectRef.current = next;
      setRect(next);
    }
  }, [s.target]);

  // Track the highlighted element cheaply: measure on step change, on scroll /
  // resize, when the element itself resizes, and for a short settle window
  // after the step opens (so late-mounted controls are picked up).
  useLayoutEffect(() => {
    setDone(false);
    measure();

    const el = s.target ? document.querySelector(s.target) : null;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });

    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);

    const ro = new ResizeObserver(measure);
    if (el) ro.observe(el);
    ro.observe(document.body);

    // settle window: catch smooth-scroll + mount animations without a permanent loop
    const started = performance.now();
    let raf = 0;
    const settle = () => {
      measure();
      if (performance.now() - started < 1400) raf = requestAnimationFrame(settle);
    };
    raf = requestAnimationFrame(settle);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [step, s.target, measure, reduce]);

  // Wait for the real click when the step asks for it
  useEffect(() => {
    if (!needsClick) return;
    const handler = (e: MouseEvent) => {
      const el = s.target ? document.querySelector(s.target) : null;
      if (el && e.target instanceof Node && el.contains(e.target)) {
        setDone(true);
        setTimeout(() => setStep((v) => (v === tut.steps.length - 1 ? v : v + 1)), 500);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [needsClick, s.target, tut.steps.length]);

  // Focus management + keyboard navigation
  useEffect(() => {
    restoreFocus.current = document.activeElement;
    cardRef.current?.focus();
    return () => (restoreFocus.current as HTMLElement | null)?.focus?.();
  }, []);

  const next = useCallback(() => (last ? onClose() : setStep((v) => v + 1)), [last, onClose]);
  const prev = useCallback(() => setStep((v) => Math.max(0, v - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); return; }
      if (e.key !== "Tab") return;
      // keep Tab inside the coach card
      const card = cardRef.current;
      if (!card) return;
      const items = card.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!items.length) return;
      const first = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === card)) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && active === lastEl) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, next, prev]);

  const pad = 8;
  const spot = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;

  // Card sits beside the control: below if there's room, otherwise above; centred when no target.
  let cardTop = vh / 2 - CARD_H / 2;
  let cardLeft = vw / 2 - CARD_W / 2;
  if (spot) {
    const below = spot.top + spot.height + 14;
    cardTop = below + CARD_H < vh ? below : Math.max(12, spot.top - CARD_H - 14);
    cardLeft = Math.min(Math.max(spot.left + spot.width / 2 - CARD_W / 2, 12), Math.max(12, vw - CARD_W - 12));
  }

  // Four blurred panels around the spotlight keep the focus razor sharp.
  const panels: Rect[] = spot
    ? [
        { top: 0, left: 0, width: vw, height: Math.max(0, spot.top) },
        { top: spot.top + spot.height, left: 0, width: vw, height: Math.max(0, vh - spot.top - spot.height) },
        { top: Math.max(0, spot.top), left: 0, width: Math.max(0, spot.left), height: spot.height },
        {
          top: Math.max(0, spot.top),
          left: spot.left + spot.width,
          width: Math.max(0, vw - spot.left - spot.width),
          height: spot.height,
        },
      ]
    : [{ top: 0, left: 0, width: vw, height: vh }];

  const glide = reduce
    ? { duration: 0 }
    : ({ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.28 } as const);

  return createPortal(
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {panels.map((p, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ top: p.top, left: p.left, width: p.width, height: p.height }}
          transition={glide}
          aria-hidden="true"
          className="absolute bg-foreground/45 backdrop-blur-[3px] pointer-events-auto will-change-[top,left,width,height]"
          onClick={onClose}
        />
      ))}

      {spot && (
        <motion.div
          initial={false}
          animate={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          transition={glide}
          aria-hidden="true"
          className="absolute rounded-2xl will-change-[top,left,width,height]"
          style={{ outline: "3px solid hsl(var(--accent))", outlineOffset: 2, boxShadow: "0 0 0 6px hsl(var(--accent) / 0.18)" }}
        />
      )}

      {/* coach card — glides to whichever control the step is about */}
      <motion.div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${tut.title} tutorial, step ${step + 1} of ${tut.steps.length}`}
        tabIndex={-1}
        initial={false}
        animate={{ top: cardTop, left: cardLeft }}
        transition={glide}
        style={{ width: CARD_W, maxWidth: "92vw" }}
        className="absolute pointer-events-auto rounded-3xl bg-card border border-border p-5 luxury-shadow outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <button onClick={onClose} aria-label="Close tutorial" className="absolute top-3.5 right-4 text-muted-foreground">
          <X size={16} aria-hidden="true" />
        </button>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          {tut.title} · {step + 1}/{tut.steps.length}
        </p>
        <div aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.18 }}
            >
              <h3 className="font-serif text-xl mb-1.5 pr-6">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              {s.why && <p className="text-xs text-accent mt-2">Why it matters: {s.why}</p>}
            </motion.div>
          </AnimatePresence>

          {needsClick && (
            <p className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px]",
              done ? "bg-accent/20 text-accent" : "bg-secondary/70 text-foreground")}
            >
              <MousePointerClick size={13} aria-hidden="true" />
              {done ? "Nice one!" : rect ? "Click the highlighted control to continue" : "Looking for that control on this page…"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 my-4" aria-hidden="true">
          {tut.steps.map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-accent" : "w-1.5 bg-border")} />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1 text-xs text-muted-foreground disabled:opacity-40"
          >
            <ChevronLeft size={14} aria-hidden="true" /> Back
          </button>
          <button
            onClick={next}
            className="flex items-center gap-1 bg-accent text-accent-foreground px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest"
          >
            {last ? "Finish" : needsClick ? "Skip" : "Next"} {!last && <ChevronRight size={14} aria-hidden="true" />}
          </button>
        </div>
        <p className="sr-only">Use the left and right arrow keys to move between steps, or press Escape to exit the tutorial.</p>
      </motion.div>
    </div>,
    document.body,
  );
}
