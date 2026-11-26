import type { Metadata } from "next";
import Link from "next/link";
import { CalculatorMockup } from "@/components/mockups/CalculatorMockup";

// Mockup app opened from the homepage Utilities folder; not search content.
export const metadata: Metadata = {
  title: "Calculator | tranmer.ca",
  robots: { index: false, follow: true },
};

export default function CalculatorPage() {
  return (
    <main className="min-h-dvh bg-black grid place-items-center p-4">
      <div className="w-full max-w-xs">
        <Link href="/" className="mb-6 inline-block text-sm text-orange-400 hover:underline">
          ← Home
        </Link>
        <CalculatorMockup />
      </div>
    </main>
  );
}
