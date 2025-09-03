import Link from "next/link";
import Image from "next/image";

export type AppIconProps = {
  href: string;
  label: string;
  emoji: string;
  gradient: string;
  openInNewWindow?: boolean;
  iconSrc?: string;
  iconBorder?: string;
};

export function AppIcon({ href, label, emoji, gradient, openInNewWindow = false, iconSrc, iconBorder }: AppIconProps) {
  const isExternal = href.startsWith('http');
  
  // Use custom styling for image icons or fallback to gradient
  const iconClasses = iconSrc 
    ? `border-2 ${iconBorder || 'border-white/20'}`
    : `${gradient} border border-white/20`;
  
  if (isExternal && openInNewWindow) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center gap-2"
        aria-label={label}
      >
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-[77px] lg:h-[77px] rounded-2xl shadow-lg shadow-black/20 dark:shadow-black/40 grid place-items-center text-3xl sm:text-4xl lg:text-3xl text-white ${iconClasses} transition-transform group-active:scale-95 overflow-hidden`}
        >
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt={label}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <span aria-hidden className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{emoji}</span>
          )}
        </div>
        <span className="text-xs sm:text-sm font-medium text-white dark:text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {label}
        </span>
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2"
      aria-label={label}
    >
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-[77px] lg:h-[77px] rounded-2xl shadow-lg shadow-black/20 dark:shadow-black/40 grid place-items-center text-3xl sm:text-4xl lg:text-3xl text-white ${iconClasses} transition-transform group-active:scale-95 overflow-hidden`}
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={label}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <span aria-hidden className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{emoji}</span>
        )}
      </div>
      <span className="text-xs sm:text-sm font-medium text-white dark:text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {label}
      </span>
    </Link>
  );
}
