import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Wifi } from "lucide-react";
import { useLiveStatus } from "@/hooks/useRealtimeSync";

/** Small unobtrusive badge showing live connection + freshly pushed updates. */
export function LiveUpdateIndicator() {
  const { connected, lastTable, lastAt } = useLiveStatus();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!lastAt) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 2600);
    return () => clearTimeout(t);
  }, [lastAt]);

  return (
    <div className="fixed bottom-24 md:bottom-5 left-4 z-40 pointer-events-none">
      <AnimatePresence>
        {flash ? (
          <motion.div
            key="flash"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="flex items-center gap-2 rounded-full bg-terracotta text-alabaster px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] shadow-lg"
          >
            <RefreshCw size={12} className="animate-spin" />
            {lastTable} updated live
          </motion.div>
        ) : connected ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 rounded-full bg-champagne/70 text-terracotta px-2.5 py-1 text-[9px] uppercase tracking-[0.18em]"
          >
            <Wifi size={10} /> Live
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
