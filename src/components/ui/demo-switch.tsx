"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function DemoSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-1.5 rounded-full bg-card/90 dark:bg-card/80 border border-border shadow-2xl backdrop-blur-xl transition-all duration-300">
      <button
        onClick={() => setTheme("dark")}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
          isDark
            ? "bg-[#FF5E14] text-white shadow-lg shadow-[#FF5E14]/30 scale-105"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme("light")}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
          !isDark
            ? "bg-[#FF5E14] text-white shadow-lg shadow-[#FF5E14]/30 scale-105"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
    </div>
  );
}

export default DemoSwitch;
