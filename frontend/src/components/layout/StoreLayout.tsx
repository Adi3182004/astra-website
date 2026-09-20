import { Outlet, Link, useLocation } from "react-router-dom";
import { MobileHeader } from "./MobileHeader";
import { BottomNav } from "./BottomNav";
import { GoldSparkles } from "@/components/GoldSparkles";
import { Wordmark } from "@/components/brand/Wordmark";
import { useSiteSettings } from "@/lib/settings";
import { useWishlistSync } from "@/hooks/useWishlistSync";
import { useCartSync } from "@/hooks/useCartSync";
import { Instagram, Mail } from "lucide-react";
import { usePreviewFocus } from "@/hooks/usePreviewFocus";
import { CartDrawer } from "@/components/cart/CartDrawer";

/** Routes where the footer & bottom-nav should be hidden (focused checkout flow) */
const NO_FOOTER_ROUTES = ["/cart", "/checkout"];

export function StoreLayout() {
  useCartSync();
  useWishlistSync();
  usePreviewFocus();
  const { data: settings } = useSiteSettings();
  const { pathname } = useLocation();
  const hasAnnouncement = !!settings?.announcement;
  const hideFooter = NO_FOOTER_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen marble-bg text-foreground selection:bg-accent/30 overflow-x-hidden relative print:bg-white print:overflow-visible">
      <div className="print:hidden no-print">
        <GoldSparkles />
        <MobileHeader />
        <CartDrawer />
        {hasAnnouncement && (
          <div className="fixed top-[52px] inset-x-0 z-30 bg-accent/90 text-accent-foreground text-center text-[11px] uppercase tracking-widest py-1.5">
            {settings?.announcement}
          </div>
        )}
      </div>
      <main className={`print:pt-0 print:pb-0 print:max-w-none ${
        hideFooter
          ? (hasAnnouncement ? "pt-[78px]" : "pt-[52px]")
          : (hasAnnouncement ? "pt-[78px] pb-24 md:pb-10" : "pt-[52px] pb-24 md:pb-10")
      }`}>
        <div className="page-transition print:static">
          <Outlet />
        </div>
      </main>
      {!hideFooter && (
        <footer className="bg-rose-soft/40 border-t border-border/50 px-4 sm:px-6 py-10 md:pb-10 pb-28 text-center print:hidden no-print">
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">
            <Wordmark size="lg" />
            <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6 mt-4">{settings?.brand_tagline}</p>
            <div className="flex justify-center gap-6 mb-6 text-muted-foreground">
              <a href="https://mail.google.com/mail/?view=cm&to=priorabykp@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email" className="hover:text-accent transition-colors">
                <Mail size={18} />
              </a>
              <a href="https://www.instagram.com/priorabykp?igsi=MW1jaDI3Z3M4aXZ4eg==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-accent transition-colors">
                <Instagram size={18} />
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5 text-xs text-muted-foreground font-medium">
              <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
              <Link to="/page/about" className="hover:text-accent transition-colors">About Us</Link>
              <Link to="/page/support" className="hover:text-accent transition-colors">Support</Link>
              <Link to="/page/shipping" className="hover:text-accent transition-colors">Shipping Policy</Link>
              <Link to="/page/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="/page/terms" className="hover:text-accent transition-colors">Terms</Link>
              <Link to="/page/contact" className="hover:text-accent transition-colors">Contact</Link>
              <Link to="/account" className="hover:text-accent transition-colors">Account</Link>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-6">
              © {new Date().getFullYear()} PRIORA by KP · Jewellery that reflects your Aura
            </p>
          </div>
        </footer>
      )}
      {!hideFooter && <BottomNav />}
    </div>
  );
}
