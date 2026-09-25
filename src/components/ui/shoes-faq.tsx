"use client";

import React, { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

export function ShoesFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does ASTRA footwear fit compared to standard athletic shoes?",
      a: "Our speed runners and high-tops fit true to US athletic sizing. If you have wider feet or prefer a relaxed lifestyle fit, we recommend ordering half a size up. Every product page includes a millimeter measurement chart.",
    },
    {
      q: "What warranty is included with the dual carbon-fiber propulsion plate?",
      a: "All ASTRA carbon-plate models come with a lifetime structural warranty against plate fractures or delamination under normal athletic running and streetwear usage.",
    },
    {
      q: "Do you offer worldwide express shipping and customs clearance?",
      a: "Yes! We ship globally via DHL Express with all import duties and local taxes prepaid at checkout. Orders to North America, Europe, and Asia-Pacific arrive in 2 to 4 business days.",
    },
    {
      q: "How should I clean and maintain my ASTRA shoes?",
      a: "For technical knit and mesh uppers, wipe gently with lukewarm water and mild sneaker cleaner. For Italian nubuck models, use a soft horsehair brush and specialized suede protector spray. Never machine wash.",
    },
    {
      q: "What is your return and exchange policy?",
      a: "We offer 30-day complimentary exchanges and returns on unworn shoes in their original collector box and tags.",
    },
  ];

  return (
    <section id="faq" className="relative w-full py-24 sm:py-32 bg-card/60 border-t border-border overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="h-3.5 w-3.5" /> BUYER GUIDE & FIT
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Frequently Asked <span className="text-[#FF5E14]">Questions.</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Everything you need to know about sizing, drops, carbon-fiber technology, and worldwide delivery.
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

export default ShoesFAQ;
