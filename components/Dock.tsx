"use client";

import { useState } from "react";

type DockProps = {
  onSwipeRight: () => void;
  showApps: boolean;
};

export function Dock({ onSwipeRight, showApps }: DockProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only show progress for horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const progress = Math.max(0, Math.min(100, (deltaX / 100) * 100));
      setSwipeProgress(progress);
    }
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

    // Reset states
    setTouchStart(null);
    setSwipeProgress(0);
    setIsActive(false);
  };

  const handleClick = () => {
    onSwipeRight();
  };

  return (
    <div 
      className={`relative h-16 rounded-3xl bg-white/60 dark:bg-white/10 backdrop-blur border border-black/5 dark:border-white/10 flex items-center justify-center text-xs text-white dark:text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] cursor-pointer hover:bg-white/70 dark:hover:bg-white/20 transition-all duration-200 select-none flex-shrink-0 overflow-hidden ${isActive ? 'scale-105' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={showApps ? "Swipe right or tap to lock apps" : "Swipe right or tap to unlock apps"}
    >
      {/* Progress indicator background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-3xl transition-all duration-200 ${
          swipeProgress > 0 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: `${swipeProgress}%`,
          background: `linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3))`
        }}
      />
      
      {/* Slider indicator */}
      <div className="absolute left-2 flex items-center gap-1">
        <div className={`w-1 h-6 bg-white/50 rounded-full transition-all duration-200 ${isActive ? 'bg-white/80' : ''}`} />
        <div className={`w-1 h-4 bg-white/30 rounded-full transition-all duration-200 ${isActive ? 'bg-white/60' : ''}`} />
        <div className={`w-1 h-2 bg-white/20 rounded-full transition-all duration-200 ${isActive ? 'bg-white/40' : ''}`} />
        {swipeProgress > 20 && (
          <div className="text-xs text-white/80 ml-2 font-medium">
            →
          </div>
        )}
      </div>

      {/* Main text content */}
      <div className="relative z-10">
        {showApps ? "Swipe right or tap to lock" : "Swipe right or tap to unlock"}
      </div>
      
      {/* Completion indicator */}
      {swipeProgress > 80 && (
        <div className="absolute right-2 text-green-400 font-bold">
          ✓
        </div>
      )}
    </div>
  );
}
