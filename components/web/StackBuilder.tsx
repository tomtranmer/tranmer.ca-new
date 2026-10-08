"use client";

import { useState } from "react";
import {
  addons,
  annualTotalFor,
  buildSprint,
  formatAddonPrice,
  formatPrice,
  includedAddonIds,
  includedNote,
  layersBottomUp,
  money,
  premiumRank,
  totalFor,
  type Selection,
} from "@/lib/offerings";

// Card treatments by premium rank: the more capable (and costly) a tier, the
// richer its gradient, border and shadow.
const rankStyles = [
  {
    card: "border-foreground/15 bg-background",
    sub: "text-foreground/60",
    unit: "text-foreground/60",
  },
  {
    card: "border-sky-300 bg-gradient-to-br from-sky-50 to-white shadow-sm dark:border-sky-800 dark:from-sky-950/50 dark:to-background",
    sub: "text-foreground/60",
    unit: "text-foreground/60",
  },
  {
    card: "border-indigo-400 bg-gradient-to-br from-indigo-100 via-white to-violet-100 shadow-md shadow-indigo-500/15 dark:border-indigo-600 dark:from-indigo-950/70 dark:via-background dark:to-violet-950/60",
    sub: "text-foreground/65",
    unit: "text-foreground/60",
  },
  {
    card: "border-amber-400/70 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 text-white shadow-xl shadow-violet-600/30",
    sub: "text-white/70",
    unit: "text-white/60",
  },
] as const;


export function StackBuilder() {
  const [selection, setSelection] = useState<Partial<Selection>>({});
  const [sprint, setSprint] = useState(false);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const included = includedAddonIds(selection, { sprint });
  const paidAddonIds = addonIds.filter((id) => !included.includes(id));
  const { known, pending } = totalFor(selection, { sprint, addonIds: paidAddonIds });
  const annual = annualTotalFor(paidAddonIds);
  const chosenAddons = addons.filter((a) => addonIds.includes(a.id) || included.includes(a.id));
  const addonPrice = (a: (typeof addons)[number]) =>
    included.includes(a.id) ? "Included" : formatAddonPrice(a);
  const toggleAddon = (id: string, on: boolean) =>
    setAddonIds((ids) => (on ? [...ids, id] : ids.filter((x) => x !== id)));

  // Each level unlocks only once every level below it has a selection.
  const isUnlocked = (index: number) =>
    layersBottomUp.slice(0, index).every((l) => selection[l.id]);
  const sprintUnlocked = layersBottomUp
    .filter((l) => l.id !== "build")
    .every((l) => selection[l.id]);
  const complete = layersBottomUp.every((l) => selection[l.id] || (sprint && l.id === "build"));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-10">
        {layersBottomUp.map((layer, index) => {
          const replaced = sprint && layer.id === "build";
          const locked = !isUnlocked(index);
          const previous = layersBottomUp[index - 1];
          return (
            <fieldset key={layer.id} disabled={locked}>
              <legend className="mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Level {layer.level} · {layer.name}
                </span>
                <span className="block text-xl font-semibold">{layer.question}</span>
              </legend>
              {locked && previous && (
                <p className="mb-3 text-sm text-foreground/50">
                  Choose your {previous.name} (Level {previous.level}) first.
                </p>
              )}
              {replaced && (
                <p className="mb-3 text-sm text-amber-700 dark:text-amber-400">
                  Replaced by the {buildSprint.name} this month.
                </p>
              )}
              <div
                className={`grid gap-3 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] ${
                  replaced || locked ? "pointer-events-none opacity-40" : ""
                }`}
              >
                {layer.tiers.map((tier) => {
                  const checked = selection[layer.id] === tier.id;
                  const rank = premiumRank(layer, tier.id);
                  const style = rankStyles[rank];
                  return (
                    <label
                      key={tier.id}
                      className={`relative cursor-pointer rounded-xl border-2 p-4 transition hover:-translate-y-0.5 ${style.card} ${
                        checked ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-background" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={layer.id}
                        value={tier.id}
                        checked={checked}
                        disabled={replaced}
                        onChange={() => setSelection((s) => ({ ...s, [layer.id]: tier.id }))}
                        className="sr-only"
                      />
                      {rank === 3 && (
                        <span className="mb-2 inline-block rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-900">
                          Premium
                        </span>
                      )}
                      {checked && (
                        <span
                          aria-hidden
                          className="absolute top-3 right-3 grid h-5 w-5 place-items-center rounded-full bg-blue-500 text-xs text-white"
                        >
                          ✓
                        </span>
                      )}
                      <span className="block pr-6 font-semibold">{tier.name}</span>
                      <span className={`block text-sm ${style.sub}`}>{tier.tagline}</span>
                      <span className="mt-2 block text-lg font-bold">
                        {formatPrice(tier)}
                        {tier.price ? <span className={`text-sm font-normal ${style.unit}`}>/mo</span> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <label
          className={`relative block cursor-pointer overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-zinc-950 via-violet-950 to-zinc-950 p-5 text-white shadow-2xl shadow-amber-500/20 transition hover:-translate-y-0.5 ${
            sprint ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-background" : ""
          } ${sprintUnlocked ? "" : "pointer-events-none opacity-40"}`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-400/30 blur-3xl"
          />
          <span className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={sprint}
              disabled={!sprintUnlocked}
              onChange={(e) => setSprint(e.target.checked)}
              className="mt-1 h-4 w-4 accent-amber-400"
            />
            <span>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Monthly upgrade
              </span>
              <span className="block text-lg font-semibold">
                {buildSprint.name} · {money(buildSprint.price)}
                <span className="text-sm font-normal text-white/60">/mo</span>
              </span>
              <span className="block text-sm text-white/70">{buildSprint.description}</span>
            </span>
          </span>
        </label>

        <fieldset>
          <legend className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Optional
            </span>
            <span className="block text-xl font-semibold">Product add-ons</span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {addons.map((addon) => {
              const free = included.includes(addon.id);
              const checked = free || addonIds.includes(addon.id);
              return (
                <label
                  key={addon.id}
                  className={`flex items-start ${free ? "" : "cursor-pointer"} gap-3 rounded-xl border-2 border-foreground/15 bg-background p-4 transition hover:-translate-y-0.5 ${
                    checked ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={free}
                    onChange={(e) => toggleAddon(addon.id, e.target.checked)}
                    className="mt-1 h-4 w-4 accent-blue-500"
                  />
                  <span>
                    <span className="block font-semibold">{addon.name}</span>
                    <span className="block text-sm text-foreground/60">{addon.tagline}</span>
                    {free ? (
                      <span className="mt-2 block font-bold">
                        <s className="font-normal text-foreground/40">{formatAddonPrice(addon)}</s>{" "}
                        <span className="text-green-700 dark:text-green-400">Included with your plan</span>
                      </span>
                    ) : (
                      <span className="mt-2 block font-bold">{formatAddonPrice(addon)}</span>
                    )}
                    {addon.includedWith && !free && (
                      <span className="mt-1 block text-xs text-foreground/50">
                        {includedNote(addon.includedWith)}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 lg:sticky lg:top-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Your stack</p>
        <ul className="mt-4 space-y-3 text-sm">
          {layersBottomUp.map((layer) => {
            const tier = layer.tiers.find((t) => t.id === selection[layer.id]);
            if (sprint && layer.id === "build") {
              return (
                <li key={layer.id} className="flex justify-between gap-2">
                  <span>{buildSprint.name}</span>
                  <span className="font-medium">{money(buildSprint.price)}</span>
                </li>
              );
            }
            if (!tier) {
              return (
                <li key={layer.id} className="flex justify-between gap-2 text-foreground/40">
                  <span>{layer.name}</span>
                  <span>—</span>
                </li>
              );
            }
            return (
              <li key={layer.id} className="flex justify-between gap-2">
                <span className="text-foreground/70">{tier.name}</span>
                <span className="font-medium">{formatPrice(tier)}</span>
              </li>
            );
          })}
          {chosenAddons.map((addon) => (
            <li key={addon.id} className="flex justify-between gap-2">
              <span className="text-foreground/70">{addon.name}</span>
              <span className="font-medium">{addonPrice(addon)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-foreground/10 pt-4">
          <p className="text-3xl font-bold">
            {money(known)}
            <span className="text-base font-normal text-foreground/60">/mo</span>
          </p>
          {annual > 0 && (
            <p className="text-sm text-foreground/60">+ {money(annual)}/yr</p>
          )}
          {pending > 0 && (
            <p className="text-xs text-foreground/50">
              + {pending} item{pending > 1 ? "s" : ""} priced on request
            </p>
          )}
          {sprint && <p className="mt-1 text-xs text-foreground/50">Sprint pricing applies to the month it&apos;s booked.</p>}
        </div>
        {complete ? (
          <a
            href={`mailto:help@tranmer.ca?subject=${encodeURIComponent("TWS plan enquiry")}&body=${encodeURIComponent(
              planSummary(selection, sprint, chosenAddons.map((a) => `${a.name} (${addonPrice(a)})`)),
            )}`}
            className="mt-6 block rounded-full bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
          >
            Request this plan
          </a>
        ) : (
          <p className="mt-6 rounded-full bg-foreground/10 px-4 py-2 text-center text-sm font-medium text-foreground/50">
            Choose all three levels to request
          </p>
        )}
      </aside>
    </div>
  );
}

function planSummary(selection: Partial<Selection>, sprint: boolean, addonLines: string[]): string {
  const lines = layersBottomUp.map((layer) => {
    if (sprint && layer.id === "build") return `${layer.name}: ${buildSprint.name}`;
    const tier = layer.tiers.find((t) => t.id === selection[layer.id]);
    return `${layer.name}: ${tier?.name ?? "Not selected"}`;
  });
  if (addonLines.length) lines.push(`Add-ons: ${addonLines.join(", ")}`);
  return `Hi Tom,\n\nI'm interested in this plan:\n\n${lines.join("\n")}\n\nAbout my project:\n`;
}
