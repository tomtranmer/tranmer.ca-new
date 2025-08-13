import { AppIcon } from "./AppIcon";

export function AppGrid() {
  return (
    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-6 place-items-center">
      <AppIcon
        href="https://app.tranmer.ca"
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
  );
}
