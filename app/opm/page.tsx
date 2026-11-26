import type { Metadata } from "next";

// Placeholder page: keep it out of search results until it has real content.
export const metadata: Metadata = {
  title: "OPM | tranmer.ca",
  robots: { index: false, follow: true },
};

export default function OPMPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">OPM</h1>
      <p className="text-foreground/80">Other People’s Money — placeholder page.</p>
    </main>
  );
}
