"use client";

import React, { useState } from "react";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";

export function PotuPricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter Package",
      badge: "Freelancers & Startups",
      price: billingCycle === "monthly" ? "$1,499" : "$1,199",
      period: "/ project",
      description: "Ideal for early-stage startups needing a high-impact MVP web app or brand identity.",
      features: [
        "Complete UI/UX Design (Up to 8 screens)",
        "Responsive Next.js Frontend",
        "Basic Design System & Styleguide",
        "Mobile & Tablet Optimization",
        "2 Rounds of Revisions",
        "14-Day Delivery Timeline",
      ],
      popular: false,
      cta: "Get Started",
    },
    {
      name: "Professional Studio",
      badge: "Most Popular",
      price: billingCycle === "monthly" ? "$3,899" : "$3,199",
      period: "/ project",
      description: "Full-service digital product design, bespoke animations, and scalable web architecture.",
      features: [
        "Full Web & Mobile UI/UX (Up to 24 screens)",
        "Next.js 15 Full-Stack + API Integration",
        "Custom 3D Spline / Framer Motion Animations",
        "Complete Design System in Figma",
        "Search Engine Optimization (SEO)",
        "Priority 24/7 Slack Support",
        "30-Day Post-Launch Warranty",
      ],
      popular: true,
      cta: "Choose Professional",
    },
    {
      name: "Enterprise Retainer",
      badge: "Dedicated Team",
      price: billingCycle === "monthly" ? "$6,999" : "$5,799",
      period: "/ month",
      description: "Dedicated principal designer & engineer for ongoing high-velocity product scaling.",
      features: [
        "Unlimited Design & Code Requests",
        "Dedicated Daily Standups & Slack Channel",
        "Design System Governance & Maintenance",
        "Complex WebGL / Shader Implementations",
        "A/B Conversion Rate Optimization",
        "Same-Day Turnaround for Quick Tasks",
        "Pause or Cancel Anytime",
      ],
      popular: false,
      cta: "Book Consultation",
    },
  ];

  return (
    <section id="pricing" className="relative w-full py-24 sm:py-32 bg-background text-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" /> TRANSPARENT INVESTMENT
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            Flexible <span className="text-[#FF5E14]">Pricing Plans.</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
            Simple, transparent pricing tailored for ambitious founders, digital agencies, and global enterprises.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-card border border-border shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs font-mono font-bold uppercase transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-[#FF5E14] text-white shadow-md shadow-[#FF5E14]/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Standard Rate
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-xs font-mono font-bold uppercase transition-all duration-300 ${
                billingCycle === "yearly"
                  ? "bg-[#FF5E14] text-white shadow-md shadow-[#FF5E14]/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual Partner (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-[36px] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? "bg-[#18181D] text-white border-2 border-[#FF5E14] shadow-2xl shadow-[#FF5E14]/15 -translate-y-2"
                  : "bg-card text-foreground border border-border shadow-sm hover:border-[#FF5E14]"
              }`}
            >
              {/* Popular Flag */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FF5E14] text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-lg shadow-[#FF5E14]/40">
                  {plan.badge}
                </div>
              )}

              <div>
                {!plan.popular && (
                  <span className="text-xs font-mono font-semibold text-[#FF5E14] uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-2xl font-black tracking-tight mt-2 mb-4">
                  {plan.name}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${plan.popular ? "text-neutral-400" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-8 pb-8 border-b border-border/80">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                    {plan.price}
                  </span>
                  <span className={`text-xs font-mono ${plan.popular ? "text-neutral-400" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>

                {/* Feature Bullet List */}
                <div className="space-y-3.5 mb-8">
                  <div className={`text-xs font-mono uppercase font-bold tracking-wider mb-2 ${plan.popular ? "text-neutral-300" : "text-foreground"}`}>
                    Included Services:
                  </div>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5E14]/20 text-[#FF5E14] flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className={`text-xs sm:text-sm ${plan.popular ? "text-neutral-300" : "text-muted-foreground"}`}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <a
                href="#contact"
                className={`w-full py-4 rounded-full font-bold font-mono text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#FF5E14] hover:bg-[#FF5E14]/90 text-white shadow-xl shadow-[#FF5E14]/30 hover:scale-105"
                    : "bg-muted hover:bg-[#FF5E14] text-foreground hover:text-white border border-border"
                }`}
              >
                {plan.cta} <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PotuPricing;
