"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, Star, Quote, Sparkles, Send, Mail } from "lucide-react";
import { ClientMarquee } from "@/components/ui/client-marquee";
import { PotuServices } from "@/components/ui/potu-services";
import { PotuPortfolioSlider } from "@/components/ui/potu-portfolio-slider";
import { PotuExperience } from "@/components/ui/potu-experience";
import { PotuDemosShowcase } from "@/components/ui/potu-demos-showcase";
import { PotuTestimonials } from "@/components/ui/potu-testimonials";
import { toast } from "sonner";

export default function Home() {
  const [heroEmail, setHeroEmail] = useState("");

  const handleHeroEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroEmail) return;
    toast.success("Welcome aboard!", {
      description: "We will send project estimates and portfolio dossiers to your email.",
    });
    setHeroEmail("");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* HERO SECTION */}
      <section id="hero" className="relative w-full pt-36 pb-20 sm:pt-44 sm:pb-32 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#FF5E14]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-8">
              {/* Greeting Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs sm:text-sm font-mono font-bold uppercase tracking-wider shadow-sm">
                <span>👋</span> HI, I'M JON KABIR
              </div>

              {/* Main Headline with Brush Underline Accent */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
                  <span className="text-[#FF5E14]">Branding,</span> Product <br className="hidden sm:inline" />
                  <span className="relative inline-block">
                    UI/UX & Design.
                    {/* SVG Brush Underline Stroke */}
                    <svg
                      className="absolute -bottom-2 sm:-bottom-3 left-0 w-full text-[#FF5E14] overflow-visible pointer-events-none"
                      viewBox="0 0 300 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 13C70 4 230 4 297 11"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
              </div>

              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                A multidisciplinary product designer & full-stack engineer creating bold visual identities, intuitive SaaS dashboards, and hyper-scalable digital experiences.
              </p>

              {/* Email Contact Form Line */}
              <form
                onSubmit={handleHeroEmailSubmit}
                className="flex items-center gap-2 max-w-md p-1.5 rounded-full bg-card border border-border shadow-lg focus-within:border-[#FF5E14] transition-all"
              >
                <div className="pl-4 text-muted-foreground">
                  <Mail className="h-4 w-4 text-[#FF5E14]" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email to connect..."
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF5E14] text-white hover:bg-[#FF5E14]/90 transition-all duration-300 shadow-md flex-shrink-0"
                  title="Submit"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* CTA Buttons & Social Icons */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF5E14] hover:bg-[#FF5E14]/90 text-white text-sm font-bold font-mono uppercase tracking-wider shadow-xl shadow-[#FF5E14]/30 hover:scale-105 transition-all duration-300"
                >
                  Let's Talk <ArrowUpRight className="h-4 w-4" />
                </a>

                <a
                  href="#portfolio"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-card hover:bg-muted text-foreground border border-border text-sm font-bold font-mono uppercase tracking-wider transition-all duration-300 shadow-sm"
                >
                  View My Work
                </a>

                {/* Social Circle Icons */}
                <div className="flex items-center gap-2">
                  {["Be", "Dr", "In"].map((social, idx) => (
                    <span
                      key={idx}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border text-foreground hover:bg-[#FF5E14] hover:border-[#FF5E14] hover:text-white transition-all duration-300 cursor-pointer text-xs font-mono font-bold shadow-sm"
                    >
                      {social}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Portrait Card */}
                <div className="relative h-[440px] sm:h-[540px] w-full rounded-[40px] overflow-hidden bg-gradient-to-tr from-[#FF5E14]/20 via-card to-card border border-border shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                    alt="Jon Kabir - Lead Designer"
                    fill
                    className="object-cover object-top"
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Bottom Portrait Badge */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">Jon Kabir</div>
                      <div className="text-[11px] font-mono text-[#FF5E14]">Principal UI/UX Designer</div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Testimonial Quote Bubble */}
                <div className="absolute -bottom-8 -left-4 sm:-left-8 max-w-xs p-5 rounded-[28px] bg-card border border-border shadow-2xl space-y-2 hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5E14] text-white">
                      <Quote className="h-4 w-4" />
                    </div>
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Client Endorsement
                    </div>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    "Design tells a story without saying a word. Jon executed our brand vision flawlessly."
                  </p>
                </div>

                {/* Floating Experience Badge */}
                <div className="absolute -top-6 -right-4 sm:-right-6 p-4 rounded-2xl bg-[#FF5E14] text-white shadow-xl shadow-[#FF5E14]/35 text-center font-mono">
                  <div className="text-2xl font-black">08+</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider">Years Exp.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENT BRAND MARQUEE */}
      <ClientMarquee />

      {/* SERVICES SECTION */}
      <PotuServices />

      {/* PORTFOLIO SHOWCASE SLIDER */}
      <PotuPortfolioSlider />

      {/* EXPERIENCE & SKILLS TIMELINE */}
      <PotuExperience />

      {/* MULTI-CONCEPT HOMEPAGE DEMOS (from tonatheme) */}
      <PotuDemosShowcase />

      {/* CLIENT TESTIMONIALS */}
      <PotuTestimonials />
    </div>
  );
}
