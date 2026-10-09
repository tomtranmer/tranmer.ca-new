import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountView } from "@/components/web/AccountView";
import { getClientSession } from "@/lib/clientSession";
import {
  getClient,
  getClientExpenses,
  planFromExpenses,
  type CurrentPlan,
  type SbClient,
} from "@/lib/sbTracker";

export const metadata: Metadata = {
  title: "Your plan | Tranmer Web Services",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getClientSession();
  if (!session) redirect("/web");

  let client: SbClient | null = null;
  let current: CurrentPlan | null = null;
  let loadError = false;
  try {
    client = await getClient(session.clientId);
    const expenses = await getClientExpenses(session.clientId);
    current = expenses ? planFromExpenses(expenses) : null;
  } catch (error) {
    loadError = true;
    console.error("SB Tracker lookup failed:", error instanceof Error ? error.message : "Unknown error");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      <main className="mx-auto max-w-5xl px-4 pt-16 pb-16">
        <AccountView
          email={session.email}
          client={
            client && {
              name: client.name,
              status: client.status,
              renewalDate: client.renewalDate,
            }
          }
          current={current}
          loadError={loadError}
        />
      </main>
    </div>
  );
}
