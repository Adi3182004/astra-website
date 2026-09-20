import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTabTitleAttention } from "@/hooks/useTabTitleAttention";

import { StoreLayout } from "@/components/layout/StoreLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import YourOrders from "./pages/YourOrders";
import InfoPage from "./pages/InfoPage";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminPages from "./pages/admin/AdminPages";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminTheme from "./pages/admin/AdminTheme";
import AdminFilters from "./pages/admin/AdminFilters";
import AdminAreas from "./pages/admin/AdminAreas";
import AdminHistory from "./pages/admin/AdminHistory";
import AdminSeo from "./pages/admin/AdminSeo";
import AdminRecommendations from "./pages/admin/AdminRecommendations";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScrollToTop } from "@/components/ScrollToTop";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/lib/store";

function CartRedirect() {
  const navigate = useNavigate();
  const openDrawer = useCart((s) => s.openDrawer);

  useEffect(() => {
    openDrawer();
    navigate("/", { replace: true });
  }, [navigate, openDrawer]);

  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min cache for instant SPA surfing without flickering
      gcTime: 1000 * 60 * 30, // 30 min garbage collection
      refetchOnWindowFocus: false,
    },
  },
});

function LiveSync() {
  useRealtimeSync();
  return null;
}

const App = () => {
  useTabTitleAttention();
  return (
    <QueryClientProvider client={queryClient}>
      <LiveSync />
      <ThemeProvider />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<CartRedirect />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/account" element={<Account />} />
              <Route path="/yourorders" element={<YourOrders />} />
              <Route path="/your-orders" element={<YourOrders />} />
              <Route path="/page/:slug" element={<InfoPage />} />
              <Route path="/privacy" element={<InfoPage />} />
              <Route path="/terms" element={<InfoPage />} />
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="offers" element={<AdminOffers />} />
              <Route path="recommendations" element={<AdminRecommendations />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="areas" element={<AdminAreas />} />
              <Route path="history" element={<AdminHistory />} />
              <Route path="seo" element={<AdminSeo />} />
              <Route path="theme" element={<AdminTheme />} />
              <Route path="filters" element={<AdminFilters />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
