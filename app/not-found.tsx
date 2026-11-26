import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | tranmer.ca",
};

export default function NotFound() {
  return (
    <main className="min-h-dvh grid place-items-center bg-background text-foreground px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">This page isn&apos;t here</h1>
        <p className="mt-4 text-foreground/70">
          It may have moved, or the link may be out of date.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Home
          </Link>
          <Link
            href="/web"
            className="rounded-full border border-foreground/20 px-5 py-2 font-semibold hover:bg-foreground/5"
          >
            Plans and pricing
          </Link>
        </div>
      </div>
    </main>
  );
}
