import Link from "next/link";

type AppIconProps = {
  href: string;
  label: string;
  emoji: string;
  gradient: string;
};

function AppIcon({ href, label, emoji, gradient }: AppIconProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2"
      aria-label={label}
    >
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md shadow-black/10 dark:shadow-white/10 grid place-items-center text-3xl sm:text-4xl text-white ${gradient} transition-transform group-active:scale-95`}
      >
        <span aria-hidden>{emoji}</span>
      </div>
      <span className="text-xs sm:text-sm font-medium text-foreground/90">
        {label}
      </span>
    </Link>
  );
}

export default function Home() {
  const phoneWallpaper =
    process.env.NEXT_PUBLIC_PHONE_WALLPAPER === "photo"
      ? "/landscape.jpg" // Place a photorealistic image here
      : "/landscape.svg"; // Fallback to generated SVG

  const pageBackground =
    process.env.NEXT_PUBLIC_SITE_WALLPAPER === "photo"
      ? "/landscape.jpg"
      : "/wallpaper.svg";

  return (
    <div className="relative min-h-screen grid place-items-center p-6 sm:p-10 overflow-hidden">
      {/* Background image (covers full layout) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url(${pageBackground})`,
        }}
      />
      {/* Soft overlay for readability */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/20" />

      
      {/* Phone frame */}
  <div className="relative w-80 sm:w-96 h-[560px] sm:h-[700px] rounded-[2.2rem] border border-black/10 dark:border-white/10 bg-gradient-to-b from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-black shadow-2xl overflow-hidden backdrop-blur">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black/80 dark:bg-black rounded-b-2xl"></div>

        {/* Phone wallpaper */}
  <div
          aria-hidden
      className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
    backgroundImage: `url(${phoneWallpaper})`,
            // filter: "saturate(1.1)",
          }}
        />
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
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-6 place-items-center">
            <AppIcon
              href="/hosting"
              label="Hosting"
              emoji="🖥️"
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            />
            <AppIcon
              href="/finance"
              label="Finance"
              emoji="💸"
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <AppIcon
              href="/opm"
              label="OPM"
              emoji="🧩"
              gradient="bg-gradient-to-br from-fuchsia-500 to-pink-600"
            />
            <AppIcon
              href="/blog"
              label="Blog"
              emoji="✍️"
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            />
          </div>

          {/* Dock */}
          <div className="mt-6 h-16 rounded-3xl bg-white/60 dark:bg-white/10 backdrop-blur border border-black/5 dark:border-white/10 flex items-center justify-center text-xs text-foreground/60">
            Swipe up • Or tap an app
          </div>
        </div>
      </div>
    </div>
  );
}
