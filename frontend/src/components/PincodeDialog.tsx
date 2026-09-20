import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, MapPin, Check, HeartCrack, Sparkles } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePincode } from "@/lib/pincode";
import { useSiteSettings } from "@/lib/settings";
import { T, useSlot } from "@/components/SlotText";

const FALLBACK = [
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=80",
];

// Feature flag: set to false to cleanly hide pincode features across the storefront
export const SHOW_PINCODE_FEATURE = false;

type Result = { ok: true; city: string; state: string; days: number; date: string } | { ok: false };

export function PincodeDialog() {
  if (!SHOW_PINCODE_FEATURE) return null;
  const { open, setOpen, pincode, set } = usePincode();
  const { data: settings } = useSiteSettings();
  const [val, setVal] = useState(pincode ?? "");
  const [err, setErr] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const placeholder = useSlot("pincode.placeholder").text;
  const buttonLabel = useSlot("pincode.button").text;
  const imgs = (settings?.pincode_images?.length ? settings.pincode_images : FALLBACK).slice(0, 3);

  async function submit() {
    if (!/^\d{6}$/.test(val)) {
      setErr("Please enter a valid 6-digit pincode");
      return;
    }
    setErr("");
    setChecking(true);
    setResult(null);
    const { data } = await supabase
      .from("service_areas")
      .select("*")
      .eq("pincode", val)
      .eq("is_active", true)
      .maybeSingle();
    setChecking(false);
    if (data) {
      const d = new Date();
      d.setDate(d.getDate() + (data.delivery_days ?? 4));
      setResult({
        ok: true,
        city: data.city,
        state: data.state,
        days: data.delivery_days ?? 4,
        date: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      });
      set(val);
    } else {
      setResult({ ok: false });
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            role="dialog"
            aria-label="Enter your pincode"
            className="fixed z-[61] inset-x-3 top-[12vh] mx-auto max-w-md rounded-3xl bg-background p-6 luxury-shadow max-h-[76vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4">
              <T k="pincode.title" as="h2" className="font-serif text-2xl" />
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 -mr-1 text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            <T k="pincode.subtitle" as="p" className="text-xs text-muted-foreground text-center mt-3 max-w-xs mx-auto" />

            <div className="flex items-end justify-center gap-2 my-6">
              {imgs.map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                  className={`overflow-hidden rounded-2xl border border-border/60 ${
                    i === 1 ? "w-28 h-36 -mt-5 z-10 luxury-shadow" : "w-24 h-28 opacity-90"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/40 p-1.5 pl-4">
              <input
                inputMode="numeric"
                maxLength={6}
                value={val}
                onChange={(e) => { setVal(e.target.value.replace(/\D/g, "")); setResult(null); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm outline-none min-w-0"
              />
              <button
                onClick={submit}
                disabled={checking}
                className="bg-accent text-accent-foreground px-5 py-2 rounded-full text-xs uppercase tracking-widest disabled:opacity-60"
              >
                {checking ? "…" : buttonLabel}
              </button>
            </div>
            {err && <p className="text-xs text-destructive mt-2">{err}</p>}

            <AnimatePresence mode="wait">
              {result?.ok && (
                <motion.div
                  key="yes"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mt-4 rounded-2xl bg-primary/50 border border-accent/30 p-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                    className="mx-auto mb-2 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center"
                  >
                    <Check size={18} />
                  </motion.div>
                  <T k="pincode.success" as="p" className="font-serif text-xl" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {result.city}, {result.state} — arriving by <strong>{result.date}</strong> ({result.days} days)
                  </p>
                  <div className="flex justify-center gap-1 mt-2 text-accent">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.15 }}>
                        <Sparkles size={12} />
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
              {result && !result.ok && (
                <motion.div
                  key="no"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-4 rounded-2xl bg-muted border border-border p-4 text-center"
                >
                  <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-rose-petal/70 flex items-center justify-center">
                    <HeartCrack size={18} className="text-accent" />
                  </div>
                  <T k="pincode.fail" as="p" className="font-serif text-xl" />
                  <T k="pincode.failHint" as="p" className="text-xs text-muted-foreground mt-1.5" />
                  <Link
                    to="/page/contact"
                    onClick={() => setOpen(false)}
                    className="inline-block mt-3 bg-accent text-accent-foreground px-5 py-2 rounded-full text-[10px] uppercase tracking-widest"
                  >
                    Contact Support
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function PincodeTrigger({ className = "" }: { className?: string }) {
  if (!SHOW_PINCODE_FEATURE) return null;
  const { pincode, setOpen } = usePincode();
  const label = useSlot("pincode.trigger").text;
  return (
    <button
      onClick={() => setOpen(true)}
      className={`flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      <MapPin size={13} className="text-accent" />
      {pincode ? `Deliver to ${pincode}` : label}
    </button>
  );
}
