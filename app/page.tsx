import Image from "next/image";
import landscape from "@/public/landscape.jpg";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const usePhotoWallpaper =
    process.env.NEXT_PUBLIC_PHONE_WALLPAPER === "photo";
  const usePhotoBackground =
    process.env.NEXT_PUBLIC_SITE_WALLPAPER === "photo";

  return (
    <div className="relative min-h-screen grid place-items-center p-6 sm:p-10 overflow-hidden">
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
            backgroundImage: `url(/wallpaper.svg)`,
          }}
        />
      )}
      {/* Soft overlay for readability */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/20" />

      <ThemeToggle />
      <PhoneFrame usePhotoWallpaper={usePhotoWallpaper} wallpaper={landscape} />
    </div>
  );
}
