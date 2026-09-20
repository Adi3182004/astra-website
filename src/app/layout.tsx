import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { AuthCardModal } from "@/components/ui/auth-card";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "ASTRA | Luxury Street-Couture & Kinetic Footwear",
  description:
    "Transcendent street-couture, raw silk tailoring, and hyper-engineered kinetic sneakers. Discover the 2026 Astra runway collection.",
  keywords: ["Astra", "Luxury Footwear", "Sneakers", "Raw Silk Hoodie", "Streetwear", "Haute Couture"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans min-h-screen bg-background text-foreground flex flex-col justify-between`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CartProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
            <CartDrawer />
            <AuthCardModal />
            <Toaster position="bottom-right" richColors theme="system" />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
