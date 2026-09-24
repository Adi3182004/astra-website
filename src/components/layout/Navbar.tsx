"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Demos", href: "#demos" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-sm py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-2xl sm:text-3xl font-black tracking-tight font-sans text-foreground">
              Potu<span className="text-[#FF5E14]">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold font-mono uppercase tracking-wider">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-muted-foreground hover:text-[#FF5E14] transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:bg-muted text-foreground transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {/* CTA Pill Button */}
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF5E14] hover:bg-[#FF5E14]/90 text-white text-xs sm:text-sm font-bold font-mono uppercase tracking-wider shadow-lg shadow-[#FF5E14]/25 hover:shadow-xl hover:shadow-[#FF5E14]/35 transition-all duration-300 hover:scale-105"
            >
              Let's Talk <ArrowUpRight className="h-4 w-4" />
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4">
            <nav className="flex flex-col space-y-3 font-mono text-sm font-semibold uppercase">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-foreground hover:bg-muted hover:text-[#FF5E14] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="pt-4 border-t border-border">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#FF5E14] text-white text-sm font-bold font-mono uppercase"
              >
                Let's Talk <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
