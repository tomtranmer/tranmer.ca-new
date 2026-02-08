"use client";

import { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

interface PartnerSpotlightProps {
  /**
   * Partner/advertiser name
   */
  name: string;

  /**
   * Brief description of the partner's services
   */
  description: string;

  /**
   * CTA button text (e.g., "Learn more", "Visit website")
   */
  ctaText?: string;

  /**
   * CTA button URL
   */
  ctaUrl: string;

  /**
   * Partner logo/icon - can be emoji, SVG, or image URL
   */
  icon?: ReactNode | string;

  /**
   * Background image URL for the banner
   */
  bgImg?: string;

  /**
   * Theme color pair: [light, dark] for backgrounds and accents
   * Examples: ["indigo", "indigo"], ["purple", "purple"], ["emerald", "emerald"]
   */
  colorScheme?: {
    light: string; // e.g., "blue-50"
    dark: string; // e.g., "blue-950"
    border: string; // e.g., "blue-200"
    darkBorder: string; // e.g., "blue-800"
    accent: string; // e.g., "blue-600"
    darkAccent: string; // e.g., "blue-400"
  };

  /**
   * Optional class to add to the container
   */
  className?: string;

  /**
   * Position of icon relative to content
   * @default "top"
   */
  iconPosition?: "top" | "left";

  /**
   * Whether to open link in new tab
   * @default true
   */
  openInNewTab?: boolean;

  /**
   * Badge/label above partner name
   * @default "Partner Spotlight"
   */
  badge?: string;

  /**
   * Optional subtitle under partner name
   */
  subtitle?: string;
}

const defaultColorScheme = {
  light: "bg-blue-50",
  dark: "dark:bg-blue-950",
  border: "border-blue-200",
  darkBorder: "dark:border-blue-800",
  accent: "text-blue-600",
  darkAccent: "dark:text-blue-400",
};

export function PartnerSpotlight({
  name,
  description,
  ctaText = "Learn more",
  ctaUrl,
  icon,
  bgImg,
  colorScheme,
  className = "",
  iconPosition = "top",
  openInNewTab = true,
  badge = "Partner Spotlight",
  subtitle,
}: PartnerSpotlightProps) {
  const colors = colorScheme || defaultColorScheme;

  const containerClasses = `
    border ${colors.border} ${colors.darkBorder}
    rounded-lg shadow-md hover:shadow-lg
    transition-all duration-300 ease-out
    overflow-hidden
    relative
    ${bgImg ? "" : `${colors.light} ${colors.dark}`}
    ${className}
  `;

  // Background overlay for text readability when bgImg is present
  const overlayClasses = bgImg
    ? "absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/40 dark:from-black/70 dark:via-black/60 dark:to-black/50"
    : "";

  const badgeClasses = `
    text-xs font-semibold uppercase tracking-wide
    ${bgImg ? "text-white/90" : `${colors.accent} ${colors.darkAccent} opacity-80`}
  `;

  const titleClasses = `
    text-xl font-bold
    ${bgImg ? "text-white" : "text-slate-900 dark:text-white"}
  `;

  const descriptionClasses = `
    text-sm leading-relaxed
    ${bgImg ? "text-white/95" : "text-slate-700 dark:text-slate-300"}
  `;

  const ctaClasses = `
    inline-flex items-center gap-2
    text-sm font-semibold
    ${bgImg ? "text-white hover:text-white/90" : `${colors.accent} ${colors.darkAccent} hover:gap-3`}
    transition-all duration-200
    group
  `;

  // Render icon if it's a string (emoji or icon content)
  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === "string") {
      return (
        <div className="text-4xl leading-none">
          {icon}
        </div>
      );
    }

    return icon;
  };

  // Top icon layout
  if (iconPosition === "top") {
    return (
      <div
        className={containerClasses}
        style={bgImg ? { backgroundImage: `url(${bgImg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {/* Background overlay for text readability when bgImg is present */}
        {bgImg && <div className={overlayClasses} />}

        {/* Content container with relative positioning to appear above overlay */}
        <div className="relative z-10 p-6 sm:p-8">
          {/* Icon */}
          {icon && (
            <div className="mb-4 transform transition-transform group-hover:scale-110">
              {renderIcon()}
            </div>
          )}

          {/* Badge */}
          <div className={badgeClasses}>{badge}</div>

          {/* Title */}
          <h3 className={`${titleClasses} mb-1 mt-3`}>{name}</h3>

          {/* Subtitle */}
          {subtitle && (
            <p className={`text-xs mb-3 font-medium ${bgImg ? "text-white/75" : "text-slate-600 dark:text-slate-400"}`}>
              {subtitle}
            </p>
          )}

          {/* Description */}
          <p className={`${descriptionClasses} mb-6`}>{description}</p>

          {/* CTA Button */}
          <a
            href={ctaUrl}
            target={openInNewTab ? "_blank" : undefined}
            rel={openInNewTab ? "noopener noreferrer" : undefined}
            className={ctaClasses}
          >
            {ctaText}
            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    );
  }

  // Left icon layout (for logos)
  return (
    <div
      className={containerClasses}
      style={bgImg ? { backgroundImage: `url(${bgImg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {/* Background overlay for text readability when bgImg is present */}
      {bgImg && <div className={overlayClasses} />}

      {/* Content container with relative positioning to appear above overlay */}
      <div className="relative z-10 flex gap-6 p-6 sm:p-8">
        {/* Left Icon/Logo */}
        {icon && (
          <div className="flex-shrink-0 flex items-start pt-1">
            {typeof icon === "string" ? (
              <div className="text-3xl leading-none">{icon}</div>
            ) : (
              <div className="w-16 h-16 flex items-center justify-center">
                {icon}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          <div className={badgeClasses}>{badge}</div>

          {/* Title */}
          <h3 className={`${titleClasses} mb-1 mt-2`}>{name}</h3>

          {/* Subtitle */}
          {subtitle && (
            <p className={`text-xs mb-2 font-medium ${bgImg ? "text-white/75" : "text-slate-600 dark:text-slate-400"}`}>
              {subtitle}
            </p>
          )}

          {/* Description */}
          <p className={`${descriptionClasses} mb-4`}>{description}</p>

          {/* CTA Button */}
          <a
            href={ctaUrl}
            target={openInNewTab ? "_blank" : undefined}
            rel={openInNewTab ? "noopener noreferrer" : undefined}
            className={ctaClasses}
          >
            {ctaText}
            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
