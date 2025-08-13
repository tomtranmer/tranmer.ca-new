import { AppIcon } from "./AppIcon";
import { AppFolder } from "./AppFolder";

export function AppGrid() {
  // Example folder with multiple apps
  const utilityApps = [
    {
      href: "/calculator",
      label: "Calculator",
      emoji: "🧮",
      gradient: "bg-gradient-to-br from-gray-500 to-gray-600"
    },
    {
      href: "https://wpmudev.com",
      label: "WPMU DEV",
      emoji: "🚀",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600"
    },
    {
      href: "/notes",
      label: "Notes",
      emoji: "📝",
      gradient: "bg-gradient-to-br from-yellow-500 to-orange-600"
    },
    {
      href: "https://my.freshbooks.com",
      label: "Freshbooks",
      emoji: "📊",
      gradient: "bg-gradient-to-br from-fuchsia-500 to-pink-600"
    },
    {
      href: "/settings",
      label: "Settings",
      emoji: "⚙️",
      gradient: "bg-gradient-to-br from-gray-600 to-gray-700"
    }
  ];

  return (
    <div className="flex-1 grid grid-cols-2 grid-rows-5 gap-6 place-items-center">
      <AppIcon
        href="https://app.tranmer.ca"
        label="SB Hosting"
        emoji="🖥️"
        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
      />
      <AppIcon
        href="https://sb-tracker.tranmer.ca"
        label="SB Finance"
        emoji="💸"
        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        openInNewWindow={true}
      />
      <AppIcon
        href="https://opm.tranmer.ca"
        label="OfficePools"
        emoji="🧩"
        gradient="bg-gradient-to-br from-fuchsia-500 to-pink-600"
        openInNewWindow={true}
      />
      <AppIcon
        href="https://tranmerwebservices.ca"
        label="Blog"
        emoji="✍️"
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
      />
      {/* Empty positions 5, 6, 7 */}
      <div></div>
      <div></div>
      <div></div>
      <AppFolder
        label="Utilities"
        gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
        apps={utilityApps}
      />
    </div>
  );
}
