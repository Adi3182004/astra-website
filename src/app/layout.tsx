import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PotuPreloader } from "@/components/ui/potu-preloader";
import { MousePointer } from "@/components/ui/mouse-pointer";
import { DemoSwitch } from "@/components/ui/demo-switch";
import { Toaster } from "sonner";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Potu | Creative UI/UX Designer & Portfolio Template",
  description:
    "High-end personal portfolio and creative agency template. Showcasing UI/UX design, branding, mobile apps, and full-stack web engineering.",
  keywords: ["Potu", "Portfolio", "UI/UX Designer", "Creative Agency", "Branding", "Next.js Template"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${outfit.variable} font-sans min-h-screen bg-background text-foreground flex flex-col justify-between antialiased transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Preloader animation */}
          <PotuPreloader />

          {/* Custom Mouse Cursor Follower */}
          <MousePointer />

          {/* Floating Theme Switcher Widget */}
          <DemoSwitch />

          {/* Main Layout Navigation */}
          <Navbar />

          <main className="flex-1 w-full">{children}</main>

          {/* Footer & Contact Form */}
          <Footer />

          {/* Global Toast Notifications */}
          <Toaster position="bottom-right" richColors theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
