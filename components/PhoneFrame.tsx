import Image, { type StaticImageData } from "next/image";
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
  return (
    <div className="relative w-80 sm:w-96 h-[560px] sm:h-[700px] rounded-[2.2rem] border border-black/10 dark:border-white/10 bg-gradient-to-b from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-black shadow-2xl overflow-hidden backdrop-blur">
      {/* Notch */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black/80 dark:bg-black rounded-b-2xl"></div>

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
      {/* Title */}
      <h1 className="absolute top-6 sm:top-8 text-center text-lg sm:text-2xl font-semibold tracking-tight text-white title-drop-shadow">
        Welcome to tranmer.ca
      </h1>
      {/* Home screen grid */}
      <div className="relative h-full flex flex-col px-6 pt-16 pb-8">
        <AppGrid />
        <Dock />
      </div>
    </div>
  );
}
