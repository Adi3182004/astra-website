"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Heart, Search, User, Sun, Moon, Menu, X, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, wishlist, setIsCartOpen, setIsAuthModalOpen } = useCart();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop All", href: "/shop" },
    { name: "Footwear", href: "/shop?category=footwear" },
    { name: "Apparel", href: "/shop?category=apparel" },
    { name: "Outerwear", href: "/shop?category=outerwear" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled
          ? "py-3 bg-background/80 backdrop-blur-2xl border-b border-border shadow-lg"
          : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#8D43F4] to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#8D43F4]/30 group-hover:scale-105 transition-transform">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tighter text-foreground group-hover:text-accent transition-colors">
              ASTRA
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground -mt-1">
              Couture & Footwear
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full bg-card/60 backdrop-blur-xl border border-border/70 shadow-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all",
                  isActive
                    ? "bg-accent text-white shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions Deck */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Theme Switcher */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-full text-foreground hover:bg-muted"
              title="Toggle Theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 scale-100" />
              ) : (
                <Moon className="h-4 w-4 text-neutral-700 transition-transform rotate-0 scale-100" />
              )}
            </Button>
          )}

          {/* User Account / Sign In */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAuthModalOpen(true)}
            className="rounded-full text-foreground hover:bg-muted"
            title="VIP Account"
          >
            <User className="h-4 w-4" />
          </Button>

          {/* Wishlist Link */}
          <Link href="/wishlist">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-foreground hover:bg-muted"
              title="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {mounted && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Button>
          </Link>

          {/* Shopping Bag Trigger */}
          <Button
            variant="violet"
            size="sm"
            onClick={() => setIsCartOpen(true)}
            className="rounded-full px-3.5 gap-2 font-medium"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            {mounted && itemCount > 0 && (
              <span className="h-5 min-w-5 px-1 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-full"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-background/95 backdrop-blur-2xl border-b border-border shadow-2xl space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex items-center justify-between px-2">
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-accent"
            >
              Sign In / VIP Member
            </button>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              Track Orders
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
