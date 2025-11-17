"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import landscape from "@/public/landscape.jpg";

import { PhoneFrame } from "@/components/PhoneFrame";
import { ThemeToggle } from "@/components/ThemeToggle";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const usePhotoWallpaper = process.env.NEXT_PUBLIC_PHONE_WALLPAPER === "photo";
  const usePhotoBackground = process.env.NEXT_PUBLIC_SITE_WALLPAPER === "photo";
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!showSplash) return;
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, [showSplash]);

  return (
    <div className="relative min-h-screen grid place-items-center p-6 sm:p-10 overflow-hidden max-[640px]:p-0 max-[640px]:min-h-dvh">
      {showSplash && <SplashScreen />}
      {/* Background image (covers full layout) */}
      {usePhotoBackground ? (
        <Image
          src={landscape}
          alt="Photorealistic landscape background"
          placeholder="blur"
          quality={80}
          fill
          className="pointer-events-none absolute inset-0 -z-10 object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `url(/backgrounds/wallpaper.svg)`,
          }}
        />
      )}
      {/* Soft overlay for readability */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/20" />

      <ThemeToggle />
      {!showSplash && (
        <PhoneFrame usePhotoWallpaper={usePhotoWallpaper} wallpaper={landscape} />
      )}
    </div>
  );
}
