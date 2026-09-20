import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCart, useWishlist, cartCount } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/shop", icon: Search, label: "Shop" },
  { to: "/wishlist", icon: Heart, label: "Wish" },
  { to: "/cart", icon: ShoppingBag, label: "Bag" },
  { to: "/account", icon: User, label: "Me" },
];

export function BottomNav() {
  const location = useLocation();
  const items = useCart((s) => s.items);
  const openDrawer = useCart((s) => s.openDrawer);
  const bagCount = cartCount(items);
  const wishCount = useWishlist((s) => s.ids.length);

  // Hide BottomNav on checkout page where dedicated full-width action bars exist
  if (location.pathname === "/checkout") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 glass-surface border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((t) => {
          if (t.to === "/cart") {
            return (
              <button
                key={t.to}
                type="button"
                onClick={openDrawer}
                className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-muted-foreground hover:text-accent transition-colors relative cursor-pointer"
              >
                <div className="relative">
                  <t.icon size={20} />
                  {bagCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-accent text-accent-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {bagCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-widest uppercase">{t.label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors relative",
                  isActive ? "text-accent" : "text-muted-foreground"
                )
              }
            >
              <div className="relative">
                <t.icon size={20} />
                {t.to === "/wishlist" && wishCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-accent text-accent-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-widest uppercase">{t.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
