"use client";

import React from "react";
import { Briefcase, GraduationCap, Award, CheckCircle2 } from "lucide-react";

export function PotuExperience() {
  const experiences = [
    {
      num: "01",
      period: "2023 - Present",
      role: "Principal Product Designer",
      company: "Apex Global Labs",
      description: "Leading multi-disciplinary design teams in creating AI enterprise design systems and web applications.",
    },
    {
      num: "02",
      period: "2021 - 2023",
      role: "Lead UI/UX & Motion Designer",
      company: "Hyperion Digital Berlin",
      description: "Crafted interactive 3D web experiences, mobile applications, and high-converting growth funnels.",
    },
    {
      num: "03",
      period: "2019 - 2021",
      role: "Senior Brand Strategist",
      company: "Studio Vanguard Tokyo",
      description: "Formulated global visual identities, digital typography guidelines, and packaging for luxury brands.",
    },
    {
      num: "04",
      period: "2017 - 2019",
      role: "UI & Frontend Engineer",
      company: "Novus Creative New York",
      description: "Engineered scalable responsive websites, component libraries, and interactive design prototypes.",
    },
  ];

  const skills = [
    { name: "UI/UX & Product Design", percentage: 98 },
    { name: "Figma & Design Systems", percentage: 95 },
    { name: "Next.js / React / TypeScript", percentage: 92 },
    { name: "Branding & Visual Identity", percentage: 94 },
    { name: "Framer Motion & Interactive 3D", percentage: 88 },
    { name: "Tailwind CSS & Web Architecture", percentage: 96 },
  ];

  return (
    <section id="about" className="relative w-full py-24 sm:py-32 bg-card/60 border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Experience Timeline */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
                <Briefcase className="h-3.5 w-3.5" /> CAREER PATHWAY
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
                Work <span className="text-[#FF5E14]">Experience.</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Over 8+ years collaborating with forward-thinking tech unicorns, luxury brands, and high-growth startups globally.
              </p>
            </div>

            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="group relative p-6 sm:p-8 rounded-[28px] bg-background border border-border hover:border-[#FF5E14] transition-all duration-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-base font-black text-[#FF5E14]">
                      {exp.num}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-[#FF5E14] transition-colors">
                          {exp.role}
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                          {exp.company}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>

                  <div className="font-mono text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FF5E14]/10 text-[#FF5E14] border border-[#FF5E14]/20 flex-shrink-0">
                    {exp.period}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Skills & Technical Mastery */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] text-xs font-mono font-semibold uppercase tracking-wider mb-4">
                <Award className="h-3.5 w-3.5" /> EXPERTISE
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
                Core <span className="text-[#FF5E14]">Skills.</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Combining high-fidelity visual craft with clean engineering standards to ship world-class software.
              </p>
            </div>

            <div className="space-y-6 p-8 rounded-[32px] bg-background border border-border shadow-sm">
              {skills.map((skill, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold font-mono">
                    <span>{skill.name}</span>
                    <span className="text-[#FF5E14]">{skill.percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF5E14] to-amber-500 transition-all duration-1000"
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Achievements Box */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[24px] bg-background border border-border shadow-sm text-center">
                <div className="text-3xl sm:text-4xl font-black text-[#FF5E14] font-mono mb-1">
                  120+
                </div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider font-mono">
                  Projects Completed
                </div>
              </div>

              <div className="p-6 rounded-[24px] bg-background border border-border shadow-sm text-center">
                <div className="text-3xl sm:text-4xl font-black text-[#FF5E14] font-mono mb-1">
                  99.8%
                </div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider font-mono">
                  Client Satisfaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PotuExperience;
