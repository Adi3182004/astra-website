"use client";

import React from "react";
import Link from "next/link";
import { SilkBackgroundAnimation } from "@/components/ui/silk-background-animation";
import { MeshGradientSVG } from "@/components/ui/shader-svg";
import { ProductCard } from "@/components/ui/product-card";
import { FluidExpandingGrid } from "@/components/ui/fluid-expanding-grid";
import { AnimatedFolder } from "@/components/ui/3d-folder";
import { ProjectShowcase } from "@/components/ui/project-showcase";
import { INITIAL_PRODUCTS } from "@/lib/products-data";
import { ArrowRight, Sparkles, Star, ChevronDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOOKBOOK_FOLDERS = [
  {
    title: "Footwear Lab",
    projects: [
      {
        id: "1",
        image: "https://cdn.21st.dev/assets/mirror/b5/b53e247c16c9009c0c84b479f179878b30db90aa2b6c483b5317f9c3cc185ba1.png",
        title: "Astra Air Rev",
      },
      {
        id: "2",
        image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80",
        title: "Cyber Runner 01",
      },
      {
        id: "3",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80",
        title: "Titan Boot",
      },
    ],
  },
  {
    title: "Raw Silk Couture",
    projects: [
      {
        id: "4",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
        title: "Heavyweight Silk Hoodie",
      },
      {
        id: "5",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80",
        title: "Monolith Trench",
      },
      {
        id: "6",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80",
        title: "Articulated Cargos",
      },
    ],
  },
];

const FAQS = [
  {
    q: "How are Astra sneakers constructed?",
    a: "Every Astra sneaker features carbon-fiber stabilizers, dual-density kinetic foam, and hand-stitched Italian calfskin uppers.",
  },
  {
    q: "What is unique about the raw silk tailoring?",
    a: "We mill 520 GSM heavyweight organic cotton interwoven with raw mulberry silk for an unmatched drape and luxurious hand feel.",
  },
  {
    q: "What is the global dispatch timeframe?",
    a: "All orders receive complimentary express air dispatch within 24 hours. Global delivery typically completes in 2-4 business days.",
  },
  {
    q: "How does the NFC certificate work?",
    a: "Each piece comes embedded with a cryptographic NFC chip. Tap with any smartphone to verify authenticity and access private drops.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION: Luminous Wave Silk Canvas with Reference Layout */}
      <SilkBackgroundAnimation />

      {/* 2. SENSORY SPOTLIGHT: Real-Time Eye-Tracking Shader Ghost */}
      <section className="relative py-16 bg-card/40 border-y border-border/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sensory Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Hyper-Fluid Responsiveness
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-md">
              Move your pointer across the screen to interact with our real-time eye-tracking shader. Designed with zero-lag precision.
            </p>
            <div className="pt-2">
              <Button variant="violet" size="lg" className="rounded-full shadow-lg shadow-accent/25" asChild>
                <Link href="/shop">
                  <span>Shop Collection</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <MeshGradientSVG />
          </div>
        </div>
      </section>

      {/* 3. FEATURED DROPS: Luxury Product Grid */}
      <section id="featured-drops" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
              Drop 001 · 2026
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-1 text-foreground">
              Featured Footwear & Apparel
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors"
          >
            <span>Explore All Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {INITIAL_PRODUCTS.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. FLUID EXPANDING GRID: Category Showcase */}
      <section className="py-20 bg-secondary/30 border-y border-border/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
              Taxonomy
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
              Select Your Category
            </h2>
          </div>
          <FluidExpandingGrid />
        </div>
      </section>

      {/* 5. 3D FOLDER LOOKBOOKS */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
            Seasonal Archives
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Interactive Lookbooks
          </h2>
          <p className="text-xs text-muted-foreground">
            Hover over each folder to spread out cards. Click to open fullscreen lightbox.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center">
          {LOOKBOOK_FOLDERS.map((folder) => (
            <AnimatedFolder
              key={folder.title}
              title={folder.title}
              projects={folder.projects}
              className="w-full max-w-md"
            />
          ))}
        </div>
      </section>

      {/* 6. SELECTED DROPS ARCHIVE */}
      <section className="py-12 bg-background/60 border-t border-border">
        <ProjectShowcase />
      </section>

      {/* 7. REVIEWS & TESTIMONIALS */}
      <section className="py-20 bg-secondary/20 border-t border-border/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
              Verified Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Client Commendations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-card border border-border shadow-lg space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                &ldquo;The Astra Air Rev are easily the most comfortable sneakers I&apos;ve ever owned. The kinetic sole absorbs shock brilliantly.&rdquo;
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs">Elena Rostova</h4>
                  <p className="text-[10px] text-muted-foreground">Milan</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-card border border-border shadow-lg space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                &ldquo;The 520 GSM raw silk hoodie drape is extraordinary. Worth every single penny for couture enthusiasts.&rdquo;
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs">Kenji Takahashi</h4>
                  <p className="text-[10px] text-muted-foreground">Tokyo</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-card border border-border shadow-lg space-y-4">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                &ldquo;Air freight delivery from Paris to NYC took under 48 hours. The NFC chip verification is top-tier.&rdquo;
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs">Marcus Sterling</h4>
                  <p className="text-[10px] text-muted-foreground">New York</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. VIP FAQ */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
            Concierge
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-sm hover:text-accent transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                    openFaq === index ? "rotate-180 text-accent" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-4 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
