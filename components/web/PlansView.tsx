"use client";

import { useState } from "react";
import { StackBuilder } from "@/components/web/StackBuilder";
import { ClientLoginModal } from "@/components/web/ClientLoginModal";

type View = "new" | "current";

const views: { id: View; label: string }[] = [
  { id: "new", label: "New clients" },
  { id: "current", label: "Current clients" },
];

export function PlansView() {
  const [view, setView] = useState<View>("new");
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          role="tablist"
          aria-label="Plan view"
          className="inline-flex rounded-full border border-foreground/15 bg-foreground/5 p-1"
        >
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              id={`plans-tab-${v.id}`}
              aria-selected={view === v.id}
              aria-controls={`plans-panel-${v.id}`}
              onClick={() => setView(v.id)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                view === v.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        {view === "new" && (
          <p className="text-sm text-foreground/60">
            Already a client?{" "}
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
            >
              Log in here
            </button>
          </p>
        )}
      </div>

      <div role="tabpanel" id={`plans-panel-${view}`} aria-labelledby={`plans-tab-${view}`}>
        {view === "new" ? (
          <StackBuilder />
        ) : (
          <section className="mx-auto max-w-xl rounded-2xl border border-foreground/15 p-8 text-center">
            <h2 className="text-2xl font-bold">Manage your plan</h2>
            <p className="mt-2 text-foreground/70">
              Log in with your email to see your current infrastructure, support and build time,
              and to request changes.
            </p>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="mt-6 rounded-full bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Log in
            </button>
          </section>
        )}
      </div>

      <ClientLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
