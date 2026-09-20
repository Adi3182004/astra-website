import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Minus, Plus, Heart } from "lucide-react";
import { useState } from "react";
import { useCart, useWishlist } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "@/components/brand/Wordmark";
import { PincodeTrigger, SHOW_PINCODE_FEATURE } from "@/components/PincodeDialog";
import { SearchBar } from "@/components/SearchBar";

type Group = { label: string; items: { label: string; to: string }[] };

const GROUPS: Group[] = [
  {
    label: "Shop by Occasion",
    items: [
      { label: "Daily Wear", to: "/shop?tag=daily" },
      { label: "Office Wear", to: "/shop?tag=office" },
      { label: "Party Wear", to: "/shop?tag=party" },
      { label: "Wedding", to: "/shop?tag=wedding" },
    ],
  },
  {
    label: "Shop by Collection",
    items: [
      { label: "Jewellery that reflects your Aura", to: "/shop?tag=infinite" },
      { label: "Everyday Essentials", to: "/shop?tag=everyday" },
      { label: "Statement Pieces", to: "/shop?tag=statement" },
    ],
  },
  {
    label: "Gifting",
    items: [
      { label: "Gifts for Her", to: "/shop?tag=her" },
      { label: "Anniversary", to: "/shop?tag=anniversary" },
      { label: "Birthday", to: "/shop?tag=birthday" },
    ],
  },
];

export function MobileHeader() {
  const items = useCart((s) => s.items);
  const openDrawer = useCart((s) => s.openDrawer);
  const count = items.reduce((a, i) => a + i.qty, 0);
  const wishCount = useWishlist((s) => s.ids.length);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [catsOpen, setCatsOpen] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const nav = useNavigate();

  const { data: cats } = useQuery({
    queryKey: ["categories-nav"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const menuCats = (cats ?? []).filter((c: any) => c.show_in_menu !== false);

  function go(to: string) {
    setOpen(false);
    nav(to);
  }

  function submitSearch() {
    if (!q.trim()) return;
    setSearchOpen(false);
    setOpen(false);
    nav(`/shop?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 glass-surface">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto relative flex items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5 min-h-[48px]">
          <div className="flex items-center">
            <button onClick={() => setOpen(true)} className="p-2 -ml-2 hover:bg-secondary/60 rounded-xl transition-colors" aria-label="Menu">
              <Menu size={20} className="text-foreground" />
            </button>
          </div>
          <Link
            to="/"
            aria-label="PRIORA by KP home"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
          >
            <Wordmark size="md" />
          </Link>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setSearchOpen((s) => !s)} className="p-2" aria-label="Search">
              <Search size={18} className="text-foreground" />
            </button>
            <Link to="/account" className="p-2 hidden xs:inline-flex" aria-label="Account">
              <User size={18} className="text-foreground" />
            </Link>
            <button
              type="button"
              onClick={openDrawer}
              className="p-2 relative cursor-pointer"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={18} className="text-foreground" />
              {count > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pincode strip (Hidden for initial launch) */}
        {SHOW_PINCODE_FEATURE && (
          <div className="border-t border-border/40 px-4 py-1.5 flex items-center justify-center">
            <PincodeTrigger />
          </div>
        )}

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/40"
            >
              <div className="px-4 py-3 max-w-6xl mx-auto">
                <SearchBar value={q} onChange={setQ} onSubmit={submitSearch} autoFocus />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Slide-out menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[92%] max-w-sm bg-background flex flex-col"
            >
              {/* Menu header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <Wordmark size="sm" />
                <div className="flex items-center gap-2 text-foreground">
                  <Link to="/wishlist" onClick={() => setOpen(false)} className="relative p-1" aria-label="Wishlist">
                    <Heart size={18} />
                    {wishCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                        {wishCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/account" onClick={() => setOpen(false)} className="p-1" aria-label="Account">
                    <User size={18} />
                  </Link>
                  <button onClick={() => setOpen(false)} className="p-1" aria-label="Close menu">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {SHOW_PINCODE_FEATURE && (
                <div className="px-4 py-3 border-b border-border/60">
                  <PincodeTrigger />
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                {/* Shop by Category */}
                <button
                  onClick={() => setCatsOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm border-b border-border/50"
                >
                  <span className="font-medium">Shop by Category</span>
                  {catsOpen ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                <AnimatePresence initial={false}>
                  {catsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                        {menuCats.map((c: any) => (
                          <button
                            key={c.id}
                            onClick={() => go(`/category/${c.slug}`)}
                            className="flex items-center justify-between gap-2 bg-[#fb1313]/[0.08] hover:bg-[#fb1313]/[0.18] border border-[#fb1313]/10 hover:border-[#fb1313]/30 transition-all rounded-xl pl-3 pr-1 py-1.5 text-left group"
                          >
                            <span className="text-sm font-medium text-foreground group-hover:text-[#fb1313] transition-colors">{c.name}</span>
                            {c.image_url ? (
                              <img
                                src={c.image_url}
                                alt=""
                                loading="lazy"
                                className="w-12 h-12 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <span className="w-12 h-12 rounded-lg bg-[#fb1313]/10 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="pb-3 text-center">
                        <button onClick={() => go("/shop")} className="text-xs underline underline-offset-4">
                          View all
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={() => go("/shop?sort=latest")} className="w-full text-left px-4 py-3.5 text-sm border-b border-border/50">
                  New Arrivals
                </button>
                <button onClick={() => go("/shop?filter=bestseller")} className="w-full text-left px-4 py-3.5 text-sm border-b border-border/50">
                  Best Seller
                </button>

                {GROUPS.map((g) => (
                  <div key={g.label} className="border-b border-border/50">
                    <button
                      onClick={() => setExpanded(expanded === g.label ? null : g.label)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-sm"
                    >
                      <span>{g.label}</span>
                      {expanded === g.label ? <Minus size={16} /> : <Plus size={16} />}
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded === g.label && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-secondary/30"
                        >
                          {g.items.map((it) => (
                            <button
                              key={it.to}
                              onClick={() => go(it.to)}
                              className="block w-full text-left px-7 py-2.5 text-sm text-muted-foreground"
                            >
                              {it.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <button onClick={() => go("/page/stores")} className="w-full text-left px-4 py-3.5 text-sm border-b border-border/50">
                  Stores &amp; Services
                </button>
              </div>

              {/* Sticky footer links */}
              <div className="grid grid-cols-3 border-t border-border/60 bg-champagne/30 text-[10px] uppercase tracking-widest text-terracotta">
                <button onClick={() => go("/page/shipping")} className="py-3 px-1 border-r border-border/50">
                  Shipping
                </button>
                <button onClick={() => go("/page/about")} className="py-3 px-1 border-r border-border/50">
                  About Us
                </button>
                <button onClick={() => go("/page/support")} className="py-3 px-1">
                  Support
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
