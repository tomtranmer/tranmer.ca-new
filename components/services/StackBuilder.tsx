"use client";

import { useState } from "react";
import {
  buildSprint,
  formatPrice,
  layersTopDown,
  totalFor,
  type LayerId,
  type Selection,
} from "@/lib/offerings";

const accents: Record<LayerId, string> = {
  build: "border-amber-500 bg-amber-500/10",
  support: "border-emerald-500 bg-emerald-500/10",
  infra: "border-blue-500 bg-blue-500/10",
};

const initial: Selection = {
  build: "build-none",
  support: "support-minimal",
  infra: "infra-billboard",
};

// Design A: an interactive configurator. One choice per row, with a running
// monthly total pinned beside the grid.
export function StackBuilder() {
  const [selection, setSelection] = useState<Selection>(initial);
  const [sprint, setSprint] = useState(false);
  const { known, pending } = totalFor(selection);
  const total = known + (sprint ? buildSprint.price : 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        {layersTopDown.map((layer) => (
          <fieldset key={layer.id}>
            <legend className="mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                Level {layer.level} · {layer.name}
              </span>
              <span className="block text-xl font-semibold">{layer.question}</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
              {layer.tiers.map((tier) => {
                const checked = selection[layer.id] === tier.id;
                return (
                  <label
                    key={tier.id}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                      checked ? accents[layer.id] : "border-foreground/10 hover:border-foreground/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name={layer.id}
                      value={tier.id}
                      checked={checked}
                      onChange={() => setSelection((s) => ({ ...s, [layer.id]: tier.id }))}
                      className="sr-only"
                    />
                    <span className="block font-semibold">{tier.name}</span>
                    <span className="block text-sm text-foreground/60">{tier.tagline}</span>
                    <span className="mt-2 block text-lg font-bold">
                      {formatPrice(tier)}
                      {tier.price ? <span className="text-sm font-normal text-foreground/60">/mo</span> : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-dashed border-amber-500/60 p-4">
          <input
            type="checkbox"
            checked={sprint}
            onChange={(e) => setSprint(e.target.checked)}
            className="mt-1 h-4 w-4 accent-amber-500"
          />
          <span>
            <span className="font-semibold">
              Add a {buildSprint.name} · ${buildSprint.price.toLocaleString("en-CA")}/mo
            </span>
            <span className="block text-sm text-foreground/60">{buildSprint.description}</span>
          </span>
        </label>
      </div>

      <aside className="h-fit rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 lg:sticky lg:top-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Your stack</p>
        <ul className="mt-4 space-y-3 text-sm">
          {layersTopDown.map((layer) => {
            const tier = layer.tiers.find((t) => t.id === selection[layer.id])!;
            return (
              <li key={layer.id} className="flex justify-between gap-2">
                <span className="text-foreground/70">{tier.name}</span>
                <span className="font-medium">{formatPrice(tier)}</span>
              </li>
            );
          })}
          {sprint && (
            <li className="flex justify-between gap-2">
              <span className="text-foreground/70">{buildSprint.name}</span>
              <span className="font-medium">${buildSprint.price.toLocaleString("en-CA")}</span>
            </li>
          )}
        </ul>
        <div className="mt-4 border-t border-foreground/10 pt-4">
          <p className="text-3xl font-bold">
            ${total.toLocaleString("en-CA")}
            <span className="text-base font-normal text-foreground/60">/mo</span>
          </p>
          {pending > 0 && (
            <p className="text-xs text-foreground/50">+ {pending} item{pending > 1 ? "s" : ""} priced on request</p>
          )}
        </div>
        <a
          href="mailto:help@tranmer.ca?subject=TWS%20plan%20enquiry"
          className="mt-6 block rounded-full bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
        >
          Request this plan
        </a>
      </aside>
    </div>
  );
}
