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
      iconSrc: "/bd_icon.png",
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
      <AppIcon
        href="https://app.getbcard.io"
        label="BCard"
        emoji="💳"
        gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
        openInNewWindow={true}
        iconSrc="/bcard_icon.png"
        iconBorder="border-blue-300/60"
      />
      <AppFolder
        label="Utilities"
        gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
        apps={utilityApps}
      />
      <AppIcon
        href="https://hivclinic.ca/app"
        label="HIV Clinic"
        emoji="🏥"
        gradient="bg-gradient-to-br from-red-500 to-pink-600"
        openInNewWindow={true}
        iconSrc="/hivclinic_icon.png"
        iconBorder="border-blue-400/60"
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
