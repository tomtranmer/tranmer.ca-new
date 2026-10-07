import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const designs = [
  { href: "/services/stack-builder", label: "A · Stack Builder" },
  { href: "/services/layers", label: "B · Layers" },
  { href: "/services/matrix", label: "C · Matrix" },
];

export function ServicesShell({
  current,
  children,
}: {
  current: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      {/* Design switcher: scaffolding only, remove once a direction is picked. */}
      <nav
        aria-label="Design options"
        className="sticky top-0 z-40 flex flex-wrap items-center gap-2 border-b border-foreground/10 bg-background/80 px-4 py-2 pr-20 text-xs backdrop-blur"
      >
        <span className="font-semibold uppercase tracking-wide text-foreground/50">Draft designs</span>
        {designs.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            aria-current={current === d.href ? "page" : undefined}
            className={`rounded-full px-3 py-1 transition-colors ${
              current === d.href
                ? "bg-blue-600 text-white"
                : "bg-foreground/5 hover:bg-foreground/10"
            }`}
          >
            {d.label}
          </Link>
        ))}
      </nav>

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

      <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>

      <footer className="border-t border-foreground/10 px-4 py-10 text-center">
        <p className="text-lg font-semibold">Not sure where to start?</p>
        <p className="mt-1 text-foreground/70">Tell us about your project and we&apos;ll suggest a combination.</p>
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
