import { AppIcon } from "./AppIcon";
import { AppFolder } from "./AppFolder";
import { ContactModal } from "./ContactModal";

type AppGridProps = {
  onModalChange: (isOpen: boolean) => void;
};

export function AppGrid({ onModalChange }: AppGridProps) {
  // Example folder with multiple apps
  const utilityApps = [
    {
      href: "https://bradshawdesign.ca",
      label: "Bradshaw Design",
      emoji: "🎨",
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconSrc: "/icons/bd_icon.png",
      iconBorder: "border-indigo-300/60"
    },{
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

  // Demo apps folder
  const demoApps = [
    {
      href: "/demos/counter",
      label: "Counter",
      emoji: "🔢",
      gradient: "bg-gradient-to-br from-green-400 to-teal-500"
    },
    {
      href: "/demos/clock",
      label: "Clock",
      emoji: "⏰",
      gradient: "bg-gradient-to-br from-amber-400 to-orange-500"
    },
    {
      href: "/demos/canvas",
      label: "Canvas",
      emoji: "🎨",
      gradient: "bg-gradient-to-br from-indigo-400 to-purple-500"
    },
    {
      href: "https://opm.tranmer.ca",
      label: "OfficePools",
      emoji: "🧩",
      gradient: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
      openInNewWindow: true
    },
    {
      href: "https://canasta.tranmer.ca",
      label: "Canasta",
      emoji: "🃏",
      gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
      openInNewWindow: true,
      iconSrc: "/icons/pwa/icon-192.svg"
    },
    {
      href: "/demos/drag",
      label: "Drag",
      emoji: "🖱️",
      gradient: "bg-gradient-to-br from-sky-400 to-blue-500"
    }
  ];

  return (
  <div className="flex-1 grid grid-cols-2 grid-rows-5 lg:grid-cols-3 lg:grid-rows-3 gap-x-6 gap-y-4 place-items-center">
      <AppIcon
        href="https://app.tranmer.ca"
        label="SB Hosting"
        emoji="🖥️"
        iconSrc="/icons/tws_icon.png"
        iconBorder="border-indigo-300/60"
        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
      />
      <AppIcon
        href="https://sb-tracker.tranmer.ca"
        label="SB Finance"
        emoji="💸"
        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        openInNewWindow={true}
      />
      <AppFolder
        label="App Demos"
        gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
        apps={demoApps}
      />
  {/* OfficePools and Canasta moved into App Demos folder */}
      <AppIcon
        href="https://tranmerwebservices.ca"
        label="Blog"
        emoji="✍️"
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
      />
      <AppIcon
        href="https://app.getbcard.io"
        label="BCard"
        emoji="💳"
        gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
        openInNewWindow={true}
        iconSrc="/icons/bcard_icon.png"
        iconBorder="border-blue-300/60"
      />
      <AppIcon
        href="https://hivclinic.ca/app"
        label="HIV Clinic"
        emoji="🏥"
        gradient="bg-gradient-to-br from-red-500 to-pink-600"
        openInNewWindow={true}
        iconSrc="/icons/hivclinic_icon.png"
        iconBorder="border-blue-400/60"
      />
      <AppFolder
        label="Utilities"
        gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
        apps={utilityApps}
      />
      <ContactModal
        label="Contact"
        emoji="📞"
        gradient="bg-gradient-to-br from-teal-500 to-cyan-600"
        onModalChange={onModalChange}
      />
      
      
    </div>
  );
}
