"use client";

import { useState } from "react";

export type BackupItem = {
  id: number;
  label: string;
  filename: string;
  sizeLabel: string;
  dateLabel: string | null;
};

export type BackupState =
  | { kind: "list"; items: BackupItem[] }
  | { kind: "blocked" }
  | { kind: "unavailable" };

export function BackupDownloads({ state }: { state: BackupState }) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const download = async (item: BackupItem) => {
    setBusyId(item.id);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/client/backups/${item.id}/download`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrorMsg(data.error ?? "We couldn't start the download. Please try again or email help@tranmer.ca.");
        return;
      }
      // The signed link is short-lived and single-file; hand it straight to the browser.
      window.location.assign(data.url);
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-foreground/15 p-6">
      <h2 className="text-xl font-semibold">Your backups</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Each year we save a complete copy of your website to offsite storage, separate from your hosting.
      </p>

      {state.kind === "blocked" && (
        <p className="mt-4 text-sm text-foreground/70">
          Backups for your account are delivered directly rather than downloaded here. Please email{" "}
          <a href="mailto:help@tranmer.ca" className="underline">help@tranmer.ca</a> and we&apos;ll arrange a copy.
        </p>
      )}

      {state.kind === "unavailable" && (
        <p className="mt-4 text-sm text-foreground/70">
          We couldn&apos;t load your backups right now. Please try again later or email{" "}
          <a href="mailto:help@tranmer.ca" className="underline">help@tranmer.ca</a>.
        </p>
      )}

      {state.kind === "list" && state.items.length === 0 && (
        <p className="mt-4 text-sm text-foreground/70">
          Your upload should be ready shortly, please check back soon.
        </p>
      )}

      {state.kind === "list" && state.items.length > 0 && (
        <ul className="mt-4 divide-y divide-foreground/10">
          {state.items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-foreground/60">
                  {[item.dateLabel, item.sizeLabel].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => download(item)}
                disabled={busyId !== null}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busyId === item.id ? "Preparing…" : "Download"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {errorMsg && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {errorMsg}
        </p>
      )}

      {state.kind === "list" && state.items.length > 0 && (
        <p className="mt-4 text-xs text-foreground/50">
          For your security, we email you whenever a backup is downloaded. Keep the file somewhere safe: it contains
          your whole website, including any customer information it holds.
        </p>
      )}
    </section>
  );
}
