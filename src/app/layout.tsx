import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PotuPreloader } from "@/components/ui/potu-preloader";
import { MousePointer } from "@/components/ui/mouse-pointer";
import { DemoSwitch } from "@/components/ui/demo-switch";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ExtensionCleaner } from "@/components/ui/extension-cleaner";
import { Toaster } from "sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ASTRA | Luxury Kinetic Footwear & Street-Couture",
  description: "ASTRA is a pioneer in aerospace carbon-fiber running shoes, luxury high-top sneakers, and kinetic streetwear footwear.",
};

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </head>
      <body
        suppressHydrationWarning
        className={`${jakarta.variable} ${outfit.variable} font-sans min-h-screen bg-background text-foreground flex flex-col justify-between antialiased transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CartProvider>
            <WishlistProvider>
              {/* Pitch-Black Minimalist Letter-Flip Preloader */}
              <PotuPreloader />

              {/* Custom Mouse Cursor Follower */}
              <MousePointer />

              {/* Floating Theme Switcher Widget */}
              <DemoSwitch />

              {/* Circular Progress Scroll-To-Top Button */}
              <ScrollToTop />

              {/* Automatic Extension & Injected Widget Purge */}
              <ExtensionCleaner />

              {/* Main Navigation */}
              <Navbar />

              <main suppressHydrationWarning className="flex-1 w-full">{children}</main>

              {/* Footer & VIP Drop Form */}
              <Footer />

              {/* Global Toast Notifications */}
              <Toaster position="bottom-right" richColors theme="system" />
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
