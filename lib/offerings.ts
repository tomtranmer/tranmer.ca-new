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
        tagline: "Email support + one minor site request a month",
        price: 50,
        features: [
          "Support requests via email",
          "Issue triage and fixes",
          "1 minor site request per month",
        ],
      },
      {
        id: "support-full",
        name: "Full Support",
        tagline: "Phone support, training + one minor site request a week",
        price: 200,
        features: [
          "Everything in Minimal",
          "Support by phone call",
          "Training for you and your team",
          "1 minor site request per week",
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
        tagline: "Sell online with faster servers and online monitoring",
        price: 50,
        features: [
          "Everything in Billboard",
          "Store + payments",
          "Faster servers",
          "Online monitoring",
          "Database + backups",
        ],
      },
      {
        id: "infra-app",
        name: "App · Integrated Hosting",
        tagline: "Includes servers, data compute and email processing (sends)",
        price: 75,
        features: [
          "Everything in eCommerce",
          "Servers + data compute",
          "Email processing (sends)",
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

export type Addon = {
  id: string;
  name: string;
  tagline: string;
  /** Price in CAD per billing period. */
  price: number;
  billing: "monthly" | "annual";
  /** What one unit of the price buys, e.g. "account". */
  unit?: string;
  /** When the add-on comes free with the plan. See `includedAddonIds`. */
  includedWith?: IncludedRule;
};

/**
 * - `hostedSupportedAbove`: plans with hosting and paid support whose monthly
 *   tiers total more than this amount.
 * - `activeBuild`: any paid Builder Availability tier, or the Build Sprint.
 */
export type IncludedRule = { hostedSupportedAbove: number } | "activeBuild";

/** Optional products that sit alongside any plan. */
export const addons: Addon[] = [
  {
    id: "addon-domain",
    name: "Domain",
    tagline: "Register and renew your domain name",
    price: 30,
    billing: "annual",
  },
  {
    id: "addon-email-imap",
    name: "Email · IMAP",
    tagline: "5 GB mailbox that works with any mail app",
    price: 5,
    billing: "monthly",
    unit: "account",
  },
  {
    id: "addon-email-gmail",
    name: "Email · Gmail",
    tagline: "Google Workspace Business Starter",
    price: 12.5,
    billing: "monthly",
    unit: "account",
  },
  {
    id: "addon-malware",
    name: "Malware Assurance",
    tagline: "Malware scanning, and cleanup if your site is ever compromised",
    price: 100,
    billing: "annual",
    includedWith: { hostedSupportedAbove: 100 },
  },
  {
    id: "addon-email-sending",
    name: "Email Sending · Resend",
    tagline: "Transactional email from your site or app",
    price: 10,
    billing: "monthly",
    includedWith: "activeBuild",
  },
  {
    id: "addon-database",
    name: "App Database · Neon",
    tagline: "Managed Postgres database for your app",
    price: 10,
    billing: "monthly",
    includedWith: "activeBuild",
  },
];

/** Formats a CAD amount, keeping cents only when there are any. */
export function money(n: number): string {
  const cents = Number.isInteger(n) ? 0 : 2;
  return `$${n.toLocaleString("en-CA", { minimumFractionDigits: cents, maximumFractionDigits: cents })}`;
}

export function formatAddonPrice(addon: Addon): string {
  const period = addon.billing === "annual" ? "/yr" : "/mo";
  return `${money(addon.price)}${period}${addon.unit ? ` per ${addon.unit}` : ""}`;
}

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
  return money(tier.price);
}

export type Selection = Record<LayerId, string>;

/** Everything the plan builder lets a client choose. */
export type PlanState = {
  selection: Partial<Selection>;
  sprint: boolean;
  addonIds: string[];
};

/**
 * Totals the known monthly prices for a selection. `pending` counts the
 * chosen tiers that don't have a price yet, so the UI can say "+ TBD".
 * With `sprint`, the Build Sprint replaces the build tier for the month.
 * Monthly add-ons are included; annual ones are totalled by `annualTotalFor`.
 */
export function totalFor(
  selection: Partial<Selection>,
  { sprint = false, addonIds = [] }: { sprint?: boolean; addonIds?: string[] } = {},
): { known: number; pending: number } {
  let known = sprint ? buildSprint.price : 0;
  let pending = 0;
  for (const addon of addons) {
    if (addon.billing === "monthly" && addonIds.includes(addon.id)) known += addon.price;
  }
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

/** Totals the chosen add-ons that bill annually. */
export function annualTotalFor(addonIds: string[]): number {
  return addons
    .filter((a) => a.billing === "annual" && addonIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
}

/** Short description of when an add-on is free, for display. */
export function includedNote(rule: IncludedRule): string {
  if (rule === "activeBuild") return "Free with any active build plan";
  return `Free with plans over ${money(rule.hostedSupportedAbove)}/mo that include hosting and support`;
}

/** Add-ons the plan gets for free, per each add-on's `includedWith` rule. */
export function includedAddonIds(
  selection: Partial<Selection>,
  { sprint = false }: { sprint?: boolean } = {},
): string[] {
  const tierPrice = (id: LayerId) =>
    getLayer(id).tiers.find((t) => t.id === selection[id])?.price ?? 0;
  const activeBuild = sprint || tierPrice("build") > 0;
  const hostedSupported = !!selection.infra && tierPrice("support") > 0;
  const { known } = totalFor(selection, { sprint });
  return addons
    .filter(({ includedWith: rule }) => {
      if (!rule) return false;
      if (rule === "activeBuild") return activeBuild;
      return hostedSupported && known > rule.hostedSupportedAbove;
    })
    .map((a) => a.id);
}
