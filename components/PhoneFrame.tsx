"use client";

import Image, { type StaticImageData } from "next/image";
import { useState, useRef } from "react";
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
  const dragStartRef = useRef({ x: 0, y: 0 });

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

  return (
    <div 
      className="relative w-80 sm:w-96 h-[560px] sm:h-[700px] rounded-[2.2rem] border-4 border-zinc-300/40 dark:border-zinc-700/60 bg-gradient-to-b from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-sm phone-frame-shine transition-transform duration-75"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Enhanced outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-[2.4rem] blur-sm -z-10 opacity-75"></div>
      
      {/* Inner highlight border for shine effect */}
      <div className="absolute inset-1 rounded-[2rem] border border-white/20 dark:border-white/10 pointer-events-none"></div>
      
      {/* Notch with enhanced styling - draggable handle */}
      <div 
        className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black/90 dark:bg-black rounded-b-2xl shadow-md border-t-2 border-zinc-800 cursor-grab active:cursor-grabbing hover:bg-black/80 transition-colors select-none"
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
      <div className="relative h-full flex flex-col px-6 pt-16 pb-8">
        <AppGrid />
        <Dock />
      </div>
    </div>
  );
}
