import { buildSprint, formatPrice, layersTopDown, type LayerId } from "@/lib/offerings";

const bands: Record<LayerId, { band: string; chip: string; width: string }> = {
  build: {
    band: "from-amber-400 to-orange-500",
    chip: "bg-white/15",
    width: "lg:mx-16",
  },
  support: {
    band: "from-emerald-500 to-teal-600",
    chip: "bg-white/15",
    width: "lg:mx-8",
  },
  infra: {
    band: "from-blue-600 to-indigo-700",
    chip: "bg-white/15",
    width: "",
  },
};

// Design B: a visual "stack" read as an architecture diagram. The foundation
// is widest; each layer above narrows, so the page itself explains the model.
export function LayeredStack() {
  return (
    <div className="space-y-4">
      <div className="relative mx-auto max-w-md rounded-2xl border-2 border-dashed border-amber-500/70 p-4 text-center">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
          Optional boost
        </span>
        <p className="font-semibold">
          {buildSprint.name} · ${buildSprint.price.toLocaleString("en-CA")}/mo
        </p>
        <p className="text-sm text-foreground/60">{buildSprint.description}</p>
      </div>

      {layersTopDown.map((layer) => {
        const style = bands[layer.id];
        return (
          <section
            key={layer.id}
            className={`rounded-3xl bg-gradient-to-r p-6 text-white shadow-lg ${style.band} ${style.width}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold">{layer.name}</h2>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Level {layer.level}
              </span>
            </div>
            <p className="mt-1 text-white/80">{layer.summary}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
              {layer.tiers.map((tier) => (
                <div key={tier.id} className={`rounded-2xl p-4 backdrop-blur ${style.chip}`}>
                  <p className="font-semibold">{tier.name}</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(tier)}
                    {tier.price ? <span className="text-sm font-normal text-white/70">/mo</span> : null}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-white/85">
                    {tier.features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <p className="pt-2 text-center text-sm text-foreground/60">
        Every plan starts with infrastructure. Add support and build time as you need them.
      </p>
    </div>
  );
}
