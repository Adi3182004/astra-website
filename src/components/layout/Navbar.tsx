"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ShoppingBag, Sun, Moon, Menu, X, ArrowUpRight, Flame } from "lucide-react";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Collection", href: "#collection" },
    { name: "Silhouettes", href: "#categories" },
    { name: "Technology", href: "#technology" },
    { name: "Features", href: "#features" },
    { name: "Reviews", href: "#reviews" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border py-3 shadow-md"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo (ASTRA / POTU Luxury Footwear) */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF5E14] text-white shadow-lg shadow-[#FF5E14]/30 group-hover:scale-105 transition-all">
              <span className="font-black text-xl tracking-tighter">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-widest uppercase font-sans text-foreground">
                ASTRA
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#FF5E14] font-bold -mt-1">
                KINETIC FOOTWEAR
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground hover:text-[#FF5E14] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Group */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground hover:text-[#FF5E14] shadow-sm transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {/* Shopping Bag CTA */}
            <a
              href="#collection"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FF5E14] hover:bg-[#FF5E14]/90 text-white text-xs font-bold font-mono uppercase tracking-wider shadow-lg shadow-[#FF5E14]/30 hover:scale-105 transition-all"
            >
              <ShoppingBag className="h-4 w-4" /> Shop Drops
            </a>

            {/* Mobile Menu Hamburger Toggler */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4 animate-in fade-in-0 slide-in-from-top-4">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-mono font-bold uppercase tracking-wider text-foreground hover:text-[#FF5E14] py-2 border-b border-border/50"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
