// Single source of truth for the TWS 3x3 offering grid.
// Every design variant under app/services renders from this file, so pricing
// and copy changes only need to happen here.

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
        // TODO(pricing): set the monthly price for billboard hosting.
        price: null,
        priceLabel: "TBD",
        features: ["Static / brochure site", "Custom domain + SSL", "Global CDN"],
      },
      {
        id: "infra-ecommerce",
        name: "Web · eCommerce",
        tagline: "Sell online",
        // TODO(pricing): set the monthly price for eCommerce hosting.
        price: null,
        priceLabel: "TBD",
        features: ["Everything in Billboard", "Store + payments", "Database + backups"],
      },
      {
        id: "infra-app",
        name: "App · Integrated Hosting",
        tagline: "Custom software, fully hosted",
        // TODO(pricing): set the monthly price for integrated app hosting.
        price: null,
        priceLabel: "TBD",
        features: [
          "Everything in eCommerce",
          "Custom app + APIs",
          "Integrations, auth and background jobs",
        ],
      },
    ],
  },
];

/** Occasional full-time sprint, available on top of any combination. */
export const buildSprint = {
  id: "build-sprint",
  name: "Build Sprint",
  tagline: "Full-time build for a month",
  price: 2500,
  description:
    "When a project needs a push, book an occasional month of full-time development on top of any plan.",
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
 */
export function totalFor(selection: Selection): { known: number; pending: number } {
  let known = 0;
  let pending = 0;
  for (const layer of layers) {
    const tier = layer.tiers.find((t) => t.id === selection[layer.id]);
    if (!tier) continue;
    if (tier.price === null) pending += 1;
    else known += tier.price;
  }
  return { known, pending };
}

/** Example bundles, used by the matrix design. */
export const presets: { name: string; blurb: string; selection: Selection }[] = [
  {
    name: "Launch",
    blurb: "A billboard site you manage yourself.",
    selection: { infra: "infra-billboard", support: "support-none", build: "build-none" },
  },
  {
    name: "Grow",
    blurb: "An online store with email support and a feature a month.",
    selection: { infra: "infra-ecommerce", support: "support-minimal", build: "build-starter" },
  },
  {
    name: "Partner",
    blurb: "A custom app, fully supported, with an active builder.",
    selection: { infra: "infra-app", support: "support-full", build: "build-active" },
  },
];
