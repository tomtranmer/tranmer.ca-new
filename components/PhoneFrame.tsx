"use client";

import Image, { type StaticImageData } from "next/image";
import { useState, useRef, useEffect } from "react";
import { AppGrid } from "./AppGrid";
import { Dock } from "./Dock";

// ...existing code...
type PhoneFrameProps = {
  usePhotoWallpaper: boolean;
  wallpaper: StaticImageData;
};

export function PhoneFrame({
  usePhotoWallpaper,
  wallpaper,
}: PhoneFrameProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showApps, setShowApps] = useState(true);
  const [isPWA, setIsPWA] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Detect PWA mode
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = Boolean((window.navigator as {standalone?: boolean}).standalone);
    
    setIsPWA(isStandalone || (isIOS && isInStandaloneMode));
  }, []);

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    setPosition({
      x: clientX - dragStartRef.current.x,
      y: clientY - dragStartRef.current.y,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const toggleApps = () => {
    setShowApps(!showApps);
  };

  return (
    <div 
      className={`relative w-80 sm:w-96 h-[560px] sm:h-[700px] rounded-[2.2rem] border-4 border-zinc-300/40 dark:border-zinc-700/60 bg-gradient-to-b from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-sm phone-frame-shine transition-transform duration-75 max-[640px]:w-full max-[640px]:h-full max-[640px]:rounded-none max-[640px]:border-0 max-[640px]:shadow-none ${isPWA ? 'pwa-standalone' : ''}`}
      style={{
        transform: isPWA ? 'none' : `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseMove={!isPWA ? handleMouseMove : undefined}
      onMouseUp={!isPWA ? handleDragEnd : undefined}
      onMouseLeave={!isPWA ? handleDragEnd : undefined}
      onTouchMove={!isPWA ? handleTouchMove : undefined}
      onTouchEnd={!isPWA ? handleDragEnd : undefined}
    >
      {/* Enhanced outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[2.4rem] blur-sm -z-10 opacity-75 max-[640px]:hidden"></div>
      
      {/* Inner highlight border for shine effect */}
      <div className="absolute inset-1 rounded-[2rem] border border-white/20 dark:border-white/10 pointer-events-none max-[640px]:hidden"></div>
      
      {/* Notch with enhanced styling - draggable handle */}
      <div 
        className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black/90 dark:bg-black rounded-b-2xl shadow-md border-t-2 border-zinc-800 cursor-grab active:cursor-grabbing hover:bg-black/80 transition-colors select-none max-[640px]:hidden"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        title="Drag to move phone"
      ></div>

      {/* Phone wallpaper */}
      {usePhotoWallpaper ? (
        <Image
          src={wallpaper}
          alt="Photorealistic landscape wallpaper"
          placeholder="blur"
          quality={80}
          fill
          className="absolute inset-0 -z-10 object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `url(/landscape.svg)`,
          }}
        />
      )}
      {/* Wallpaper overlay: subtle blur + dim for readability */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none backdrop-blur-2 bg-black/10"
      />
      
      {/* Title - centered in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-xl sm:text-3xl font-bold tracking-wide text-white/80 title-drop-shadow text-center px-4">
          Welcome to tranmer.ca
        </h1>
      </div>
      
      {/* Home screen grid */}
      <div className="relative h-full flex flex-col px-6 pt-16 pb-12 max-[640px]:px-4 max-[640px]:pt-8 max-[640px]:pb-6">
        <div className={`flex-1 min-h-0 transition-all duration-300 ${showApps ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <AppGrid />
        </div>
        <div className="mt-6 flex-shrink-0">
          <Dock onSwipeRight={toggleApps} showApps={showApps} />
        </div>
      </div>
    </div>
  );
}
