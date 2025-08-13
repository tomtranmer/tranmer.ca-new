import Link from "next/link";

export type AppIconProps = {
  href: string;
  label: string;
  emoji: string;
  gradient: string;
};

export function AppIcon({ href, label, emoji, gradient }: AppIconProps) {
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
