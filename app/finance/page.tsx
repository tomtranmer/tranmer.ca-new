import type { Metadata } from "next";

// Placeholder page: keep it out of search results until it has real content.
export const metadata: Metadata = {
  title: "Finance | tranmer.ca",
  robots: { index: false, follow: true },
};

export default function FinancePage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Finance</h1>
      <p className="text-foreground/80">Placeholder page for finance.</p>
    </main>
  );
}
