"use client";

import React, { useState } from "react";
import { ArrowUpRight, Mail, MapPin, Phone, Send, ArrowUp } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "UI/UX Design",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    toast.success("Thank you! Your message has been received.", {
      description: "Jon Kabir & the Potu team will review your inquiry within 24 hours.",
    });
    setFormData({ name: "", email: "", service: "UI/UX Design", message: "" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="relative w-full bg-[#111114] text-white pt-24 pb-12 border-t border-neutral-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Massive Callout Header */}
        <div className="mb-20 pb-16 border-b border-neutral-800 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
              <span>✦</span> START A PROJECT
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight max-w-2xl">
              Let's Work <br />
              <span className="text-[#FF5E14]">Together.</span>
            </h2>
          </div>

          <p className="max-w-md text-neutral-400 text-sm sm:text-base leading-relaxed">
            Have an ambitious project or want to take your brand to the next level? Fill in the form or send a direct email.
          </p>
        </div>

        {/* Form and Contact Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          {/* Direct Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-[32px] bg-[#18181D] border border-neutral-800 space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Studio Headquarters
              </h3>

              <div className="space-y-4 text-sm text-neutral-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-[#FF5E14] flex-shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 font-mono uppercase">Direct Email</div>
                    <a href="mailto:contact@potu.studio" className="font-semibold text-white hover:text-[#FF5E14] transition-colors">
                      contact@potu.studio
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-[#FF5E14] flex-shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 font-mono uppercase">Phone / WhatsApp</div>
                    <span className="font-semibold text-white">+1 (555) 839-2041</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-[#FF5E14] flex-shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 font-mono uppercase">Studio Locations</div>
                    <span className="font-semibold text-white">SoHo, New York & Shibuya, Tokyo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Pills */}
            <div className="p-8 rounded-[32px] bg-[#18181D] border border-neutral-800">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#FF5E14] font-semibold mb-4">
                Connect Globally
              </h4>
              <div className="flex flex-wrap gap-2.5 font-mono text-xs">
                {["Dribbble", "Behance", "LinkedIn", "Instagram", "GitHub", "Twitter/X"].map((soc, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-2 rounded-full bg-neutral-900 text-neutral-300 hover:text-white hover:bg-[#FF5E14] border border-neutral-800 transition-all cursor-pointer"
                  >
                    {soc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="p-8 sm:p-12 rounded-[36px] bg-[#18181D] border border-neutral-800 space-y-6 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Send a Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jon Kabir"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-[#FF5E14] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jon@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-[#FF5E14] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
                  Service Needed
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full h-12 px-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-[#FF5E14] transition-colors"
                >
                  <option value="UI/UX Design">UI/UX & Product Design</option>
                  <option value="Branding & Identity">Branding & Identity Direction</option>
                  <option value="Full-Stack Web Development">Full-Stack Next.js Web Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="3D Motion & WebGL">3D Motion & WebGL Experience</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-semibold">
                  Project Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your project goals, timelines, and scope..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-[#FF5E14] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-14 rounded-full bg-[#FF5E14] hover:bg-[#FF5E14]/90 text-white font-bold font-mono text-sm uppercase tracking-wider shadow-xl shadow-[#FF5E14]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Send Inquiry Now <ArrowUpRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <p>© 2026 POTU CREATIVE STUDIO. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Terms of Service</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-[#FF5E14] hover:underline cursor-pointer"
            >
              Back To Top <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
