"use client";

import { useState } from "react";

type DockProps = {
  onSwipeRight: () => void;
  showApps: boolean;
};

export function Dock({ onSwipeRight, showApps }: DockProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Check for horizontal swipe (left to right) gesture
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
      onSwipeRight();
    }

    setTouchStart(null);
  };

  const handleClick = () => {
    onSwipeRight();
  };

  return (
    <div 
      className="h-16 rounded-3xl bg-white/60 dark:bg-white/10 backdrop-blur border border-black/5 dark:border-white/10 flex items-center justify-center text-xs text-white dark:text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] cursor-pointer hover:bg-white/70 dark:hover:bg-white/20 transition-colors select-none flex-shrink-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={showApps ? "Swipe right or tap to lock apps" : "Swipe right or tap to unlock apps"}
    >
      {showApps ? "Swipe right or tap to lock" : "Swipe right or tap to unlock"}
    </div>
  );
}
