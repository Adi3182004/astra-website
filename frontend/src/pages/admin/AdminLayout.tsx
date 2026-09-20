import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { TutorialButton } from "@/components/Tutorial";
import { useRoles } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Package, Layers, Image as ImageIcon, ShoppingBag, Settings, ArrowLeft, Star, Video, FileText, Images, Palette, MapPin, Users, History, Search, SlidersHorizontal, Gift, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreviewButton } from "@/components/admin/PreviewButton";
import type { PreviewKey } from "@/lib/preview";
import { SHOW_PINCODE_FEATURE } from "@/components/PincodeDialog";

const allItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/offers", icon: Gift, label: "Offers & Deals" },
  { to: "/admin/recommendations", icon: Sparkles, label: "Recommendations" },
  { to: "/admin/categories", icon: Layers, label: "Categories" },
  { to: "/admin/banners", icon: ImageIcon, label: "Banners" },
  { to: "/admin/reviews", icon: Star, label: "Reviews" },
  { to: "/admin/videos", icon: Video, label: "Videos" },
  { to: "/admin/pages", icon: FileText, label: "Pages" },
  { to: "/admin/media", icon: Images, label: "Media" },
  { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { to: "/admin/areas", icon: MapPin, label: "Delivery areas", adminOnly: true, isPincode: true },
  { to: "/admin/history", icon: History, label: "History" },
  { to: "/admin/seo", icon: Search, label: "SEO", adminOnly: true },
  { to: "/admin/theme", icon: Palette, label: "Theme", adminOnly: true },
  { to: "/admin/filters", icon: SlidersHorizontal, label: "Filters", adminOnly: true },
  { to: "/admin/staff", icon: Users, label: "Staff", adminOnly: true },
  { to: "/admin/settings", icon: Settings, label: "Settings", adminOnly: true },
];

const items = allItems.filter(item => !item.isPincode || SHOW_PINCODE_FEATURE);


const TUTORIAL_BY_PATH: Record<string, string> = {
  "/admin": "admin-dashboard",
  "/admin/products": "admin-products",
  "/admin/categories": "admin-categories",
  "/admin/banners": "admin-banners",
  "/admin/reviews": "admin-reviews",
  "/admin/videos": "admin-videos",
  "/admin/pages": "admin-pages",
  "/admin/media": "admin-media",
  "/admin/orders": "admin-orders",
  "/admin/areas": "admin-areas",
  "/admin/history": "admin-history",
  "/admin/theme": "admin-theme",
  "/admin/settings": "admin-settings",
  "/admin/staff": "admin-staff",
};

const PREVIEW_BY_PATH: Record<string, PreviewKey> = {
  "/admin/products": "products",
  "/admin/categories": "categories",
  "/admin/banners": "banners",
  "/admin/reviews": "reviews",
  "/admin/videos": "videos",
  "/admin/pages": "pages",
  "/admin/media": "media",
  "/admin/orders": "orders",
  "/admin/areas": "areas",
  "/admin/theme": "theme",
  "/admin/settings": "settings",
};

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const tutorialId =
    TUTORIAL_BY_PATH[pathname.replace(/\/$/, "") || "/admin"] ??
    (pathname.startsWith("/admin/products") ? "admin-products" : "admin-dashboard");
  const previewKey: PreviewKey | undefined =
    PREVIEW_BY_PATH[pathname.replace(/\/$/, "")] ??
    (pathname.startsWith("/admin/products") ? "products" : undefined);
  const { isAdmin, isStaff } = useRoles();
  const ADMIN_ONLY_PATHS = ["/admin/theme", "/admin/settings", "/admin/areas", "/admin/staff", "/admin/seo"];

  if (loading) return null;
  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (!isStaff) return (
    <div className="p-8 text-center max-w-md mx-auto">
      <p className="text-muted-foreground mb-4">You don't have admin access.</p>
      <Link to="/" className="text-accent underline">Back to store</Link>
    </div>
  );
  if (!isAdmin && ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p)))
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <p className="text-muted-foreground mb-4">Editors can't change this area — ask an admin.</p>
        <Link to="/admin" className="text-accent underline">Back to dashboard</Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="md:w-60 md:min-h-screen bg-rose-soft/40 border-r border-border/50 md:sticky md:top-0">
        <div className="p-4 flex items-center justify-between md:block">
          <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <ArrowLeft size={14} /> Store
          </Link>
          <p className="font-serif text-2xl mt-2">Admin</p>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible px-2 pb-2 md:pb-4 gap-1">
          {items.filter((i) => isAdmin || !(i as any).adminOnly).map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end} data-tour={`nav-${i.to.split("/").pop()}`} className={({ isActive }) =>
              cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap",
                isActive ? "bg-accent text-accent-foreground" : "hover:bg-secondary/60")
            }>
              <i.icon size={16} /> {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main data-tour="admin-main" className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
        <div className="flex justify-end items-center gap-2 mb-4 flex-wrap">
          {previewKey && <PreviewButton target={previewKey} label="Full Preview" />}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all shadow-sm font-medium"
            title="Open published live storefront in new tab"
          >
            <ExternalLink size={12} /> Live Store
          </a>
          <span data-tour="tutorial-button"><TutorialButton id={tutorialId} /></span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
