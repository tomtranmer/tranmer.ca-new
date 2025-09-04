"use client";

import { useState } from "react";
import Image from "next/image";
import { AppIcon, type AppIconProps } from "./AppIcon";

export type AppFolderProps = {
  label: string;
  gradient: string;
  apps: AppIconProps[];
};

export function AppFolder({ label, gradient, apps }: AppFolderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openFolder = () => {
    setIsOpen(true);
  };

  const closeFolder = () => {
    setIsOpen(false);
  };

  // Create a preview grid showing the first 4 apps as mini icons
  const previewApps = apps.slice(0, 4);

  return (
    <>
      {/* Folder Icon */}
      <div
        className="group flex flex-col items-center gap-2 cursor-pointer"
        onClick={openFolder}
        role="button"
        tabIndex={0}
        aria-label={`Open ${label} folder`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFolder();
          }
        }}
      >
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 md:w-[77px] md:h-[77px] lg:w-[77px] lg:h-[77px] rounded-2xl shadow-lg shadow-black/20 dark:shadow-black/40 grid grid-cols-2 grid-rows-2 gap-1 p-2 ${gradient} transition-transform group-active:scale-95 border border-white/20`}
        >
          {previewApps.map((app, index) => (
            <div
              key={index}
              className="bg-white/30 rounded-lg flex items-center justify-center text-xs overflow-hidden"
            >
              {app.iconSrc ? (
                <Image
                  src={app.iconSrc}
                  alt={app.label}
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {app.emoji}
                </span>
              )}
            </div>
          ))}
          {/* Fill remaining slots with empty squares if needed */}
          {Array.from({ length: 4 - previewApps.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-white/10 rounded-lg"
            />
          ))}
        </div>
        <span className="text-xs sm:text-sm font-medium text-white dark:text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {label}
        </span>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 rounded-3xl overflow-hidden border border-white/20 dark:border-white/10"
          onClick={closeFolder}
        >
          {/* Modal Content */}
          <div
            className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-3xl p-6 max-w-3xl w-full "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Folder Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {label}
              </h2>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {apps.map((app, index) => (
                <div key={index} onClick={closeFolder}>
                  <AppIcon {...app} />
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="text-center">
              <button
                onClick={closeFolder}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors border border-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
