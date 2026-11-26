import type { Metadata } from "next";
import Link from "next/link";
import { SettingsMockup } from "@/components/mockups/SettingsMockup";

// Mockup app opened from the homepage Utilities folder; not search content.
export const metadata: Metadata = {
  title: "Settings | tranmer.ca",
  robots: { index: false, follow: true },
};

export default function SettingsPage() {
  return (
    <main className="min-h-dvh bg-zinc-100 dark:bg-black text-foreground p-4">
      <div className="mx-auto w-full max-w-md pt-6 pb-12">
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-4 px-4 text-3xl font-bold">Settings</h1>
        <SettingsMockup />
      </div>
    </main>
  );
}
