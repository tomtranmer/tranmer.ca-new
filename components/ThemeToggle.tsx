"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-black/20 backdrop-blur border border-white/20 flex items-center justify-center text-white/70">
        🌙
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    // Also notify other UI to cycle wallpapers when theme changes
    try {
      window.dispatchEvent(new CustomEvent('cycleWallpaper'));
    } catch (e) {
      // ignore in non-browser environments
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-black/20 dark:bg-white/20 backdrop-blur border border-white/20 dark:border-black/20 flex items-center justify-center text-white dark:text-black hover:bg-black/30 dark:hover:bg-white/30 transition-all duration-200 shadow-lg"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className="text-lg drop-shadow-sm">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
