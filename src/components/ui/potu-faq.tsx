"use client";

import React, { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

export function PotuFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What design tools and development tech stacks do you specialize in?",
      a: "For design, we work primarily in Figma, Spline 3D, and Adobe Creative Cloud for design systems, wireframes, and prototypes. For development, we build blazing-fast production applications using Next.js 15, React, TypeScript, Tailwind CSS, and Framer Motion.",
    },
    {
      q: "How long does a typical UI/UX or full-stack web project take?",
      a: "A standard brand identity or MVP web app typically takes 2 to 4 weeks from discovery to delivery. Larger enterprise design systems and complex web applications range between 6 to 10 weeks depending on screen count and backend requirements.",
    },
    {
      q: "Do you offer post-launch support and ongoing design retainers?",
      a: "Yes! Every custom project includes 30 days of complimentary bug fixes and optimization support. We also provide monthly retainer plans for teams requiring dedicated weekly sprints and design system governance.",
    },
    {
      q: "Can you collaborate directly with our internal engineering team?",
      a: "Absolutely. We provide clean, modular component code, pixel-perfect Figma auto-layout files with design tokens, and clear documentation to ensure seamless developer handoff.",
    },
    {
      q: "How do we get started with an initial estimate or consultation?",
      a: "Simply fill out our project inquiry form below or send an email to contact@potu.studio. We'll schedule a 20-minute discovery call and provide a detailed scope of work within 24 hours.",
    },
  ];

  return (
    <section id="faq" className="relative w-full py-24 sm:py-32 bg-card/60 border-t border-border overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="h-3.5 w-3.5" /> COMMON QUESTIONS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Frequently Asked <span className="text-[#FF5E14]">Questions.</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Everything you need to know about working with Potu creative studio.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-background border-[#FF5E14] shadow-md"
                    : "bg-background/80 border-border hover:border-neutral-400"
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-bold text-base sm:text-lg text-foreground">
                    {faq.q}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 transition-colors ${
                    isOpen ? "bg-[#FF5E14] text-white" : "bg-muted text-foreground"
                  }`}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-7 pb-6 sm:pb-7 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PotuFAQ;
