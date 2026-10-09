import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlansView } from "@/components/web/PlansView";

export const metadata: Metadata = {
  title: "Plans | Tranmer Web Services",
  description:
    "Choose your infrastructure, TWS support and monthly build time. Tranmer Web Services plans for websites, online stores and apps.",
  alternates: { canonical: "/web" },
};

export default function WebPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />

      <header className="mx-auto max-w-5xl px-4 pt-16 pb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Tranmer Web Services
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Build your plan in three choices
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/70">
          Pick the infrastructure your project runs on, how much support you want from TWS,
          and how much build time to reserve each month.
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <PlansView />
      </main>

      <footer className="border-t border-foreground/10 px-4 py-10 text-center">
        <p className="text-lg font-semibold">Not sure where to start?</p>
        <p className="mt-1 text-foreground/70">
          Tell us about your project and we&apos;ll suggest a combination.
        </p>
        <a
          href="mailto:help@tranmer.ca?subject=TWS%20plan%20enquiry"
          className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Email help@tranmer.ca
        </a>
      </footer>
    </div>
  );
}
