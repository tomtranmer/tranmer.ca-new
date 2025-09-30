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
      href: "https://tranmerwebservices.ca",
      label: "Blog",
      emoji: "✍️",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600"
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
      href: "https://canasta.tranmer.ca",
      label: "Canasta",
      emoji: "🃏",
      gradient: "bg-gradient-to-br from-rose-500 to-red-500",
      openInNewWindow: true,
      // iconSrc: "/icons/pwa/icon-192.svg"
    },
    {
      href: "https://booking.tranmer.ca",
      label: "Booking",
      emoji: "📅",
      gradient: "bg-gradient-to-br from-sky-500 to-indigo-500",
      openInNewWindow: true
    },
    {
      href: "https://sb-tracker.tranmer.ca",
      label: "SB_Tracker",
      emoji: "📈",
      gradient: "bg-gradient-to-br from-emerald-400 to-teal-600",
      openInNewWindow: true
    },
    {
      href: "https://opm.tranmer.ca",
      label: "OfficePools",
      emoji: "🏆",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
      openInNewWindow: true
    },
    {
      href: "https://mybank.tranmer.ca",
      label: "MyBank",
      emoji: "🏦",
      gradient: "bg-gradient-to-br from-indigo-600 to-emerald-500",
      openInNewWindow: true
    }
  ];

  return (
  <div className="flex-1 grid grid-cols-2 grid-rows-5 lg:grid-cols-3 lg:grid-rows-3 gap-x-6 gap-y-4 place-items-center">
      <AppIcon
        href="https://web.tranmer.ca"
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
        iconSrc="/icons/sb_finance_icon.png"
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
        href="https://tranmer.ca/app"
        label="Appstravaganza"
        emoji="⭐"
        iconSrc="/icons/app_icon.png"
        gradient="bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600"
        openInNewWindow={true}
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
        href="https://mybank.tranmer.ca"
        label="MyBank"
        emoji="🏦"
        iconSrc="/icons/mybank_icon.png"
        gradient="bg-gradient-to-br from-yellow-400 to-orange-500"
        openInNewWindow={true}
      />
      <AppIcon
        href="https://mycar.tranmer.ca"
        label="MyCarC"
        emoji="🚗"
        gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
        openInNewWindow={true}
        iconSrc="/icons/mycar-icon-real.png"
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
