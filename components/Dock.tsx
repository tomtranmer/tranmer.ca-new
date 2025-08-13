"use client";

import { useState } from "react";

type DockProps = {
  onSwipeUp: () => void;
};

export function Dock({ onSwipeUp }: DockProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touchStart.y - touch.clientY; // Reversed because up is negative Y

    // Check for swipe up gesture (vertical movement more than horizontal, and upward)
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 50) {
      onSwipeUp();
    }

    setTouchStart(null);
  };

  const handleClick = () => {
    onSwipeUp();
  };

  return (
    <div 
      className="mt-6 h-16 rounded-3xl bg-white/60 dark:bg-white/10 backdrop-blur border border-black/5 dark:border-white/10 flex items-center justify-center text-xs text-white dark:text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] cursor-pointer hover:bg-white/70 dark:hover:bg-white/20 transition-colors select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Swipe up or tap to open apps"
    >
      Swipe • Or tap to open apps
    </div>
  );
}
