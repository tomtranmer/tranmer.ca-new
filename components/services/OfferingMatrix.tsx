import { buildSprint, formatPrice, getLayer, layersTopDown, presets, totalFor } from "@/lib/offerings";

// Design C: a classic comparison grid. Layers are rows, tiers are cells, and a
// few example bundles underneath show how the rows combine.
export function OfferingMatrix() {
  return (
    <div className="space-y-12">
      <div className="overflow-hidden rounded-2xl border border-foreground/10">
        {layersTopDown.map((layer, i) => (
          <div
            key={layer.id}
            className={`grid gap-px bg-foreground/10 md:grid-cols-[200px_1fr] ${i > 0 ? "border-t border-foreground/10" : ""}`}
          >
            <div className="bg-background p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Level {layer.level}
              </p>
              <h2 className="text-lg font-bold">{layer.name}</h2>
              <p className="mt-1 text-sm text-foreground/60">{layer.question}</p>
            </div>
            <div className="grid gap-px sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
              {layer.tiers.map((tier) => (
                <div key={tier.id} className="bg-background p-5">
                  <p className="font-semibold">{tier.name}</p>
                  <p className="text-sm text-foreground/60">{tier.tagline}</p>
                  <p className="mt-3 text-2xl font-bold">
                    {formatPrice(tier)}
                    {tier.price ? <span className="text-sm font-normal text-foreground/60">/mo</span> : null}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-foreground/75">
                    {tier.features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-foreground/10 bg-amber-500/10 p-5">
          <p>
            <span className="font-semibold">{buildSprint.name}:</span>{" "}
            <span className="text-foreground/70">{buildSprint.description}</span>
          </p>
          <p className="text-xl font-bold">${buildSprint.price.toLocaleString("en-CA")}/mo</p>
        </div>
      </div>

      <section>
        <h2 className="text-center text-2xl font-bold">Popular combinations</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {presets.map((preset) => {
            const { known, pending } = totalFor(preset.selection);
            return (
              <div key={preset.name} className="rounded-2xl border border-foreground/10 p-6">
                <h3 className="text-xl font-bold">{preset.name}</h3>
                <p className="mt-1 text-sm text-foreground/60">{preset.blurb}</p>
                <ul className="mt-4 space-y-1 text-sm">
                  {layersTopDown.map((l) => {
                    const tier = getLayer(l.id).tiers.find((t) => t.id === preset.selection[l.id])!;
                    return <li key={l.id}>{tier.name}</li>;
                  })}
                </ul>
                <p className="mt-4 text-2xl font-bold">
                  ${known.toLocaleString("en-CA")}
                  <span className="text-sm font-normal text-foreground/60">/mo</span>
                </p>
                {pending > 0 && <p className="text-xs text-foreground/50">+ items priced on request</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
