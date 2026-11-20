import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReviewRequestForm } from "@/components/web/ReviewRequestForm";
import { getClientSession } from "@/lib/clientSession";
import { REVIEW_EMAIL_COOKIE, emailFromLink, sanitizeSource } from "@/lib/reviewRequest";

export const metadata: Metadata = {
  title: "Get your 2027 review | Tranmer Web Services",
  description: "Ask Tranmer Web Services to review your hosting, domains, email and backups for 2027.",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const source = sanitizeSource(Array.isArray(params.src) ? params.src[0] : params.src);

  // A logged-in client's own address comes first; otherwise the newsletter link's.
  const session = await getClientSession();
  const store = await cookies();
  const initialEmail = session?.email ?? emailFromLink(store.get(REVIEW_EMAIL_COOKIE)?.value) ?? "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      <main className="mx-auto max-w-xl px-4 pt-16 pb-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Tranmer Web Services
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Get your 2027 review</h1>
        <p className="mt-4 text-lg text-foreground/70">
          We&rsquo;ll look over your hosting, domains, email and backups and recommend the right plan for 2027.
          There&rsquo;s no charge and no obligation.
        </p>
        <div className="mt-8">
          <ReviewRequestForm initialEmail={initialEmail} source={source} />
        </div>
        <p className="mt-8 text-sm text-foreground/60">
          You can also see all plans on <a href="/web" className="underline hover:text-foreground">tranmer.ca/web</a>{" "}
          or email <a href="mailto:help@tranmer.ca" className="underline hover:text-foreground">help@tranmer.ca</a>.
        </p>
      </main>
    </div>
  );
}
