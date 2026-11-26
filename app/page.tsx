import type { Metadata } from "next";
import Link from "next/link";
import { HomeClient } from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Tom Tranmer | Tranmer Web Services",
  description:
    "Tom Tranmer builds and looks after websites, online stores and apps for small businesses through Tranmer Web Services: hosting, domains, email, backups and ongoing development.",
  // Only the homepage is canonical to "/". Query-string variants (?s=, ?utm_…)
  // collapse here; other pages must not inherit this from the root layout.
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <HomeClient />

      {/* Server-rendered so crawlers see real content, not just the splash screen. */}
      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tom Tranmer, Tranmer Web Services
          </h1>
          <p className="mt-4 text-lg text-foreground/80">
            I build things, mostly digital. Through Tranmer Web Services I build and look after
            websites, online stores and apps for small businesses, from the hosting, domains, email
            and backups underneath to the features your customers use.
          </p>
          <p className="mt-4 text-lg text-foreground/80">
            Clients choose the infrastructure their project runs on, how much support they want,
            and how much build time to reserve each month.
          </p>
          <ul className="mt-8 space-y-3 text-lg">
            <li>
              <Link href="/web" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                See plans and pricing
              </Link>
            </li>
            <li>
              <Link href="/blog" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Read: Apps are the new spreadsheet
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
