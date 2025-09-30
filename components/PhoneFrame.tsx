"use client";

import Image, { type StaticImageData } from "next/image";
import { useState, useRef, useEffect } from "react";
import { AppGrid } from "./AppGrid";
import { Dock } from "./Dock";

// Available wallpapers for randomization
const WALLPAPERS = [
  "/wallpaper/2799FABB-777D-4351-A908-8448D6F5218E_4_5005_c.jpeg",
  "/wallpaper/6A87E0B1-CFB8-4BE2-9464-67571C33D2B1_4_5005_c.jpeg", 
  "/wallpaper/6E4863DC-3703-4DC7-BDCF-942AABB16E36_4_5005_c.jpeg",
  "/wallpaper/B7D6EBBD-0945-4707-831E-FE5CFDC5E21D_4_5005_c.jpeg",
  "/wallpaper/EAA621CF-D889-46A0-95D1-371E907CB66F_4_5005_c.jpeg"
];

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
  const [showApps] = useState(true);
  const [isPWA, setIsPWA] = useState(false);
  const [randomWallpaper, setRandomWallpaper] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Select random wallpaper on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * WALLPAPERS.length);
    setRandomWallpaper(WALLPAPERS[randomIndex]);
  }, []);

  // Cycle wallpaper when theme toggles (custom event from ThemeToggle)
  useEffect(() => {
    const handler = () => {
      setRandomWallpaper((current) => {
        const currentIndex = WALLPAPERS.indexOf(current || "");
        const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
        return WALLPAPERS[nextIndex];
      });
    };

    window.addEventListener('cycleWallpaper', handler);
    return () => window.removeEventListener('cycleWallpaper', handler);
  }, []);

  // Update clock when locked
  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isLocked]);

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

  // Toggle lock state (used by Dock interactions)
  const toggleLock = () => {
    setIsLocked((s) => !s);
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

      {/* Top status: Wi‑Fi badge on the left, icons on the right */}
      <div className="absolute top-3 left-3 z-20">
        <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 dark:bg-black/30 text-zinc-700 dark:text-white backdrop-blur-sm">
          Wi‑Fi
        </div>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-3 z-20 text-zinc-700 dark:text-white">
        <div className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-sm flex items-center gap-2">
          {/* Signal strength icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="3" y="16" width="2" height="5" rx="1" fill="currentColor" />
            <rect x="7" y="13" width="2" height="8" rx="1" fill="currentColor" />
            <rect x="11" y="10" width="2" height="11" rx="1" fill="currentColor" />
            <rect x="15" y="7" width="2" height="14" rx="1" fill="currentColor" />
          </svg>

          {/* WiFi icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M2 8.5C6 5 11 3 16 3c5 0 10 2 14 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 12.5c3-2 7-3 10-3s7 1 10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 16.5c1.8-1.2 4-1.8 6-1.8s4.2.6 6 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="20" r="1.6" fill="currentColor" />
          </svg>

          {/* Battery icon + percentage */}
          <div className="flex items-center gap-1">
            <svg className="w-5 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="2" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
              <rect x="20" y="9" width="2" height="6" rx="0.5" fill="currentColor" />
              <rect x="4" y="8" width="12.5" height="8" rx="1" fill="currentColor" />
            </svg>
            <span className="text-xs font-medium">88%</span>
          </div>
        </div>
      </div>

      {/* Phone wallpaper */}
      {usePhotoWallpaper && randomWallpaper ? (
        <Image
          src={randomWallpaper}
          alt="Random photorealistic landscape wallpaper"
          fill
          quality={80}
          sizes="(max-width: 640px) 100vw, 384px"
          className="absolute inset-0 -z-10 object-cover"
        />
      ) : usePhotoWallpaper ? (
        <Image
          src={wallpaper}
          alt="Photorealistic landscape wallpaper"
          placeholder="blur"
          quality={80}
          fill
          sizes="(max-width: 640px) 100vw, 384px"
          className="absolute inset-0 -z-10 object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `url(/backgrounds/landscape.svg)`,
          }}
        />
      )}
      
      {/* Home screen grid */}
      <div className={`relative h-full flex flex-col px-6 pt-16 pb-12 max-[640px]:px-4 max-[640px]:pt-8 ${!isPWA ? 'max-[640px]:pb-32' : 'max-[640px]:pb-6'}`}>
        {/* Title - moved to top */}
        <div className={`flex-shrink-0 text-center mb-6 max-[640px]:mb-4 transition-all duration-300 ${isModalOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div onDoubleClick={() => setIsLocked((s) => !s)} title="Double-click to toggle lock">
            <div className="mx-auto w-48 sm:w-56 inline-flex items-center justify-center rounded-md px-3 py-1 bg-white/20 dark:bg-black/30 backdrop-blur-sm shadow-sm">
              <Image
                src="/tws-logo.png"
                alt="tranmer.ca WEB & TECH Small Business Solutions"
                width={240}
                height={48}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* When locked, show date/time below the logo in a fancier style */}
          {isLocked && (
            <div className="mt-3">
              <div className="text-sm text-white/70 uppercase tracking-wider">
                {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="w-full px-5 text-center text-4xl sm:text-5xl font-black tracking-tighter leading-tight rainbow-text fancy-display truncate">
                {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
        </div>
        <div className={`flex-1 min-h-0 transition-all duration-300 ${showApps ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          {isLocked ? (
            <div className="h-full flex flex-col justify-end">
              {/* Attribution link at bottom when locked */}
              <div className="pb-6 text-center">
                <a
                  href="https://grok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-full text-xs text-white/70 hover:text-white/90 hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-200"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 22h20L12 2z" fill="currentColor"/>
                  </svg>
                  App icons by Grok
                </a>
              </div>
            </div>
          ) : (
            <AppGrid onModalChange={setIsModalOpen} />
          )}
        </div>
        <div className={`mt-6 flex-shrink-0 transition-all duration-300 ${isModalOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <Dock onSwipeRight={toggleLock} showApps={!isLocked} />
        </div>
      </div>
    </div>
  );
}
