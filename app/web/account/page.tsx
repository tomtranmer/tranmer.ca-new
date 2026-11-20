import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountView } from "@/components/web/AccountView";
import type { BackupState } from "@/components/web/BackupDownloads";
import { formatBytes, isBackupDownloadBlocked, listBackupsForClient } from "@/lib/backups";
import { getClientSession } from "@/lib/clientSession";
import {
  getClient,
  getClientExpenses,
  getLatestInvoice,
  planFromExpenses,
  type CurrentPlan,
  type LatestInvoice,
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

  // Optional extra: if it fails the page still loads, just without the invoice link.
  let latestInvoice: LatestInvoice | null = null;
  if (client?.freshbooksClientId) {
    latestInvoice = await getLatestInvoice(session.clientId).catch((error) => {
      console.error("Latest invoice lookup failed:", error instanceof Error ? error.message : "Unknown error");
      return null;
    });
  }

  const backups = await loadBackupState(session.clientId);

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
              portalUrl: client.portalUrl,
              latestInvoice,
            }
          }
          current={current}
          loadError={loadError}
          backups={backups}
        />
      </main>
    </div>
  );
}

async function loadBackupState(clientId: string): Promise<BackupState> {
  if (isBackupDownloadBlocked(clientId)) return { kind: "blocked" };
  try {
    const rows = await listBackupsForClient(clientId);
    return {
      kind: "list",
      items: rows.map((b) => ({
        id: b.id,
        label: b.label,
        filename: b.filename,
        sizeLabel: formatBytes(b.sizeBytes),
        dateLabel: b.backupDate
          ? new Date(`${b.backupDate}T12:00:00Z`).toLocaleDateString("en-CA", { dateStyle: "long", timeZone: "UTC" })
          : null,
      })),
    };
  } catch (error) {
    console.error("Backup list failed:", error instanceof Error ? error.message : "Unknown error");
    return { kind: "unavailable" };
  }
}
