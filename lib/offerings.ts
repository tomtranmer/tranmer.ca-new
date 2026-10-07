// Single source of truth for the TWS 3x3 offering grid.
// The /web page renders from this file, so pricing and copy changes only
// need to happen here.

export type LayerId = "build" | "support" | "infra";

export type Tier = {
  id: string;
  name: string;
  tagline: string;
  /** Monthly price in CAD. `null` means "priced on request" / not yet set. */
  price: number | null;
  /** Shown in place of a number when `price` is null. */
  priceLabel?: string;
  features: string[];
};

export type Layer = {
  id: LayerId;
  /** 1 = foundation (bottom), 3 = top of the stack. */
  level: 1 | 2 | 3;
  name: string;
  question: string;
  summary: string;
  tiers: Tier[];
};

export const layers: Layer[] = [
  {
    id: "build",
    level: 3,
    name: "Builder Availability",
    question: "How much build time do you want each month?",
    summary:
      "Reserve monthly development capacity for new features, fixes and ongoing projects.",
    tiers: [
      {
        id: "build-none",
        name: "On Request",
        tagline: "No monthly commitment",
        price: 0,
        priceLabel: "Quoted",
        features: ["Build quotes provided on request", "Pay per project"],
      },
      {
        id: "build-starter",
        name: "Starter Build",
        tagline: "One feature a month",
        price: 100,
        features: ["1 feature or change request per month", "Email-based scoping"],
      },
      {
        id: "build-maintenance",
        name: "Maintenance Build",
        tagline: "A steady stream of improvements",
        price: 500,
        features: [
          "Several ongoing feature requests",
          "Prioritized backlog",
          "Monthly progress summary",
        ],
      },
      {
        id: "build-active",
        name: "Active Build",
        tagline: "A build partner on your project",
        price: 1000,
        features: [
          "Active collaboration on a build project",
          "Regular check-ins",
          "Shared roadmap",
        ],
      },
    ],
  },
  {
    id: "support",
    level: 2,
    name: "TWS Support",
    question: "Who helps when something needs attention?",
    summary: "Choose how much of the day-to-day you want TWS to handle.",
    tiers: [
      {
        id: "support-none",
        name: "Self-Managed",
        tagline: "Bring your own tech",
        price: 0,
        priceLabel: "Included",
        features: ["You or your team manage the site", "Infrastructure only"],
      },
      {
        id: "support-minimal",
        name: "Minimal Support",
        tagline: "On call by email",
        // TODO(pricing): set the monthly price for minimal support.
        price: null,
        priceLabel: "TBD",
        features: ["On call for support requests via email", "Issue triage and fixes"],
      },
      {
        id: "support-full",
        name: "Full Support",
        tagline: "We run it with you",
        // TODO(pricing): set the monthly price for full support.
        price: null,
        priceLabel: "TBD",
        features: [
          "Everything in Minimal",
          "Content management requests",
          "Training for you and your team",
        ],
      },
    ],
  },
  {
    id: "infra",
    level: 1,
    name: "Infrastructure",
    question: "What are you putting online?",
    summary:
      "Each option steps up the server capability behind your project.",
    tiers: [
      {
        id: "infra-billboard",
        name: "Web · Billboard",
        tagline: "A fast, simple presence",
        price: 25,
        features: ["Static / brochure site", "Custom domain + SSL", "Global CDN"],
      },
      {
        id: "infra-ecommerce",
        name: "Web · eCommerce",
        tagline: "Sell online",
        price: 25,
        features: ["Everything in Billboard", "Store + payments", "Database + backups"],
      },
      {
        id: "infra-app",
        name: "App · Integrated Hosting",
        tagline: "Custom software, fully hosted",
        price: 25,
        features: [
          "Everything in eCommerce",
          "Custom app + APIs",
          "Integrations, auth and background jobs",
        ],
      },
    ],
  },
];

/**
 * Occasional full-time sprint. A monthly upgrade that replaces the chosen
 * Builder Availability tier for the month it's booked.
 */
export const buildSprint = {
  id: "build-sprint",
  name: "Build Sprint",
  tagline: "Full-time build for a month",
  price: 2500,
  description:
    "When a project needs a push, upgrade to a month of full-time development. It replaces your build plan for that month.",
};

/** Layers ordered top-down (Build → Support → Infrastructure). */
export const layersTopDown = [...layers].sort((a, b) => b.level - a.level);

/** Layers ordered bottom-up (Infrastructure → Support → Build). */
export const layersBottomUp = [...layers].sort((a, b) => a.level - b.level);

export function getLayer(id: LayerId): Layer {
  const layer = layers.find((l) => l.id === id);
  if (!layer) throw new Error(`Unknown layer: ${id}`);
  return layer;
}

export function formatPrice(tier: Pick<Tier, "price" | "priceLabel">): string {
  if (tier.price === null) return tier.priceLabel ?? "TBD";
  if (tier.price === 0) return tier.priceLabel ?? "$0";
  return `$${tier.price.toLocaleString("en-CA")}`;
}

export type Selection = Record<LayerId, string>;

/**
 * Totals the known monthly prices for a selection. `pending` counts the
 * chosen tiers that don't have a price yet, so the UI can say "+ TBD".
 * With `sprint`, the Build Sprint replaces the build tier for the month.
 */
export function totalFor(
  selection: Selection,
  { sprint = false }: { sprint?: boolean } = {},
): { known: number; pending: number } {
  let known = sprint ? buildSprint.price : 0;
  let pending = 0;
  for (const layer of layers) {
    if (sprint && layer.id === "build") continue;
    const tier = layer.tiers.find((t) => t.id === selection[layer.id]);
    if (!tier) continue;
    if (tier.price === null) pending += 1;
    else known += tier.price;
  }
  return { known, pending };
}

/**
 * 0-3 "premium" rank for a tier within its layer, used to escalate styling.
 * The cheapest tier is always 0 and the most capable is always 3, so a
 * three-tier layer maps to 0, 2, 3.
 */
export function premiumRank(layer: Layer, tierId: string): 0 | 1 | 2 | 3 {
  const i = layer.tiers.findIndex((t) => t.id === tierId);
  const n = layer.tiers.length;
  if (i <= 0 || n < 2) return 0;
  return Math.round((i * 3) / (n - 1)) as 0 | 1 | 2 | 3;
}
