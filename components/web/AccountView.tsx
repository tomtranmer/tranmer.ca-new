"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StackBuilder } from "@/components/web/StackBuilder";
import { freeTierId, money, type PlanState } from "@/lib/offerings";
import { expenseLabel, formatExpensePrice, type CurrentPlan, type SbClientStatus } from "@/lib/sbTracker";

type ClientSummary = {
  name: string;
  status: SbClientStatus;
  renewalDate: string | null;
};

type Status = "idle" | "submitting" | "success" | "error";

const statusStyles: Record<SbClientStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  past_due: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  canceled: "bg-foreground/10 text-foreground/60",
};

export function AccountView({
  email,
  client,
  current,
  loadError,
}: {
  email: string;
  client: ClientSummary | null;
  current: CurrentPlan | null;
  loadError: boolean;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanState>({
    // Levels 2 and 3 start on their free tiers unless the client already has one.
    selection: {
      support: freeTierId("support"),
      build: freeTierId("build"),
      ...current?.selection,
    },
    sprint: current?.sprint ?? false,
    addonIds: current?.addonIds ?? [],
  });
  const [notes, setNotes] = useState("");
  const [changeEmail, setChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const logout = async () => {
    await fetch("/api/client/logout", { method: "POST" }).catch(() => null);
    router.push("/web");
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/client/change-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...plan, notes, newEmail: changeEmail ? newEmail : "" }),
      });
      if (res.ok) {
        setStatus("success");
        return;
      }
      if (res.status === 401) {
        router.push("/web");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setErrorMsg((data as { error?: string }).error ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-foreground/20 bg-background px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Your TWS plan
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{client?.name ?? "Welcome back"}</h1>
          <p className="mt-1 text-sm text-foreground/60">Logged in as {email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          Log out
        </button>
      </header>

      <section className="rounded-2xl border border-foreground/15 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">Current plan</h2>
          {client && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[client.status]}`}>
              {client.status === "past_due" ? "Payment past due" : client.status === "active" ? "Active" : "Cancelled"}
            </span>
          )}
        </div>
        {loadError ? (
          <p className="mt-3 text-sm text-foreground/60">
            We couldn&apos;t load your plan details right now. You can still send a change request below.
          </p>
        ) : current ? (
          <CurrentPlanList current={current} />
        ) : (
          <p className="mt-3 text-sm text-foreground/60">
            Your itemised plan isn&apos;t available online yet. Describe what you&apos;d like to change below.
          </p>
        )}
        {(current || client?.renewalDate) && (
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-foreground/10 pt-4 text-sm">
            {current && (
              <div>
                <dt className="text-foreground/50">You pay</dt>
                <dd className="font-semibold">
                  {money(current.monthlyCad)}/mo
                  {current.annualCad > 0 && ` + ${money(current.annualCad)}/yr`}
                </dd>
              </div>
            )}
            {client?.renewalDate && (
              <div>
                <dt className="text-foreground/50">Renews</dt>
                <dd className="font-semibold">{client.renewalDate}</dd>
              </div>
            )}
          </dl>
        )}
      </section>

      {status === "success" ? (
        <section className="rounded-2xl border border-green-300 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/40">
          <p className="text-2xl font-bold">Request sent</p>
          <p className="mt-2 text-foreground/70">
            We&apos;ve emailed you a copy and will be in touch to confirm the details.
          </p>
        </section>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-8">
          <div>
            <h2 className="mb-1 text-2xl font-bold">Request a change</h2>
            <p className="mb-6 text-foreground/60">
              Adjust your plan below. Nothing changes until we confirm it with you.
            </p>
            <StackBuilder initial={plan} onPlanChange={setPlan} />
          </div>

          <div className="space-y-4 rounded-2xl border border-foreground/15 p-6">
            <label className="block">
              <span className="mb-1 block font-semibold">Anything else we should know?</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Timing, questions, or changes not covered above…"
                className={`${inputClass} resize-y`}
                disabled={status === "submitting"}
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={changeEmail}
                onChange={(e) => setChangeEmail(e.target.checked)}
                className="h-4 w-4 accent-blue-500"
              />
              Change the email address on my account
            </label>
            {changeEmail && (
              <input
                type="email"
                autoComplete="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                aria-label="New email address"
                className={inputClass}
                disabled={status === "submitting"}
              />
            )}

            {status === "error" && errorMsg && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {status === "submitting" ? "Sending…" : "Submit change request"}
            </button>
          </div>
        </form>
      )}

      <section className="rounded-2xl border border-dashed border-foreground/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Payment card</h2>
            <p className="text-sm text-foreground/60">Updating your card online is coming soon.</p>
          </div>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full bg-foreground/10 px-4 py-2 text-sm font-medium text-foreground/50"
          >
            Update card · coming soon
          </button>
        </div>
      </section>

      <CancelSection />
    </div>
  );
}

function CancelSection() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!confirming) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "submitting") setConfirming(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming, status]);

  const submit = async () => {
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/client/cancel-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true, reason }),
      });
      if (res.ok) {
        setStatus("success");
        setConfirming(false);
        return;
      }
      if (res.status === 401) {
        router.push("/web");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setErrorMsg((data as { error?: string }).error ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <section className="rounded-2xl border border-foreground/15 p-6">
        <h2 className="font-semibold">Cancellation request sent</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Nothing has been switched off yet. We&apos;ve emailed you a copy and will be in touch to confirm the
          details and end date.
        </p>
      </section>
    );
  }

  return (
    <section className="border-t border-foreground/10 pt-8 text-center">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm font-medium text-red-600 underline-offset-4 hover:underline dark:text-red-400"
      >
        Request cancellation
      </button>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => status !== "submitting" && setConfirming(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            aria-describedby="cancel-desc"
            className="w-full max-w-md rounded-2xl border border-foreground/15 bg-background p-6 text-left text-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cancel-title" className="text-xl font-bold">
              Request cancellation?
            </h2>
            <p id="cancel-desc" className="mt-2 text-sm text-foreground/70">
              This sends a cancellation request to TWS. Your services stay on until we confirm the details and
              end date with you.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium">Reason (optional)</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Anything we could do better, or timing we should know about…"
                className="w-full resize-y rounded-xl border border-foreground/20 bg-background px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                disabled={status === "submitting"}
              />
            </label>
            {status === "error" && errorMsg && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirming(false)}
                disabled={status === "submitting"}
                className="rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
              >
                Keep my plan
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={status === "submitting"}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {status === "submitting" ? "Sending…" : "Yes, request cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CurrentPlanList({ current }: { current: CurrentPlan }) {
  if (current.items.length === 0) {
    return <p className="mt-3 text-sm text-foreground/60">No active services on file.</p>;
  }
  return (
    <ul className="mt-4 divide-y divide-foreground/10 text-sm">
      {current.items.map((item) => (
        <li key={item.id} className="flex justify-between gap-4 py-2">
          <span className="text-foreground/70">{expenseLabel(item)}</span>
          <span className="font-medium">{formatExpensePrice(item)}</span>
        </li>
      ))}
    </ul>
  );
}
