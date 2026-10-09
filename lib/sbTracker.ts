/**
 * Server-side client for the SB Tracker external API.
 *
 * Read-only, authenticated with SB_TRACKER_API_KEY. Never import this from a
 * client component: the key must stay on the server. What this file expects
 * from SB Tracker is written up in docs/client-portal/sb-tracker-api-requirements.md.
 */
import { addons, buildSprint, layers, money, type Selection } from '@/lib/offerings';

export type SbClientStatus = 'active' | 'past_due' | 'canceled';

export type SbClient = {
  id: string;
  name: string;
  email: string;
  contactEmails: string[];
  status: SbClientStatus;
  mrrCad: number | null;
  renewalDate: string | null;
  /** TWS's own estimated monthly cost for this client. Staff only: never show it to the client. */
  estimatedCostCad: number | null;
  freshbooksClientId: string | null;
};

export type SbExpense = {
  id: string;
  name: string;
  offeringId: string | null;
  /** Null for unpriced items such as usage-billed hosting or plugins. */
  amountCents: number | null;
  interval: 'month' | 'year';
  quantity: number;
};

export type CurrentPlan = {
  selection: Partial<Selection>;
  sprint: boolean;
  addonIds: string[];
  /** Expenses that don't map to an offering, shown as "Other services". */
  other: SbExpense[];
  /** Every item with the price SB Tracker bills, for display. */
  items: SbExpense[];
  /** What the client pays, from the priced items. */
  monthlyCad: number;
  annualCad: number;
};

export class SbTrackerError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const PAGE_LIMIT = 100;
const MAX_PAGES = 20;
const TIMEOUT_MS = 10_000;

export function isSbTrackerConfigured(): boolean {
  return !!process.env.SB_TRACKER_API_URL && !!process.env.SB_TRACKER_API_KEY;
}

async function sbFetch(path: string): Promise<Response> {
  const base = process.env.SB_TRACKER_API_URL;
  const key = process.env.SB_TRACKER_API_KEY;
  if (!base || !key) throw new SbTrackerError('SB Tracker is not configured', 503);
  const res = await fetch(new URL(path, base), {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok && res.status !== 404) {
    throw new SbTrackerError(`SB Tracker ${path.split('?')[0]} returned ${res.status}`, res.status);
  }
  return res;
}

const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const cents = (v: unknown): number | null => {
  const n = num(v);
  return n === null ? null : n / 100;
};
/** "2026-11-01T00:00:00.000Z" → "2026-11-01"; other strings pass through. */
const day = (v: unknown): string | null => {
  const s = str(v);
  return s && /^\d{4}-\d{2}-\d{2}T/.test(s) ? s.slice(0, 10) : s;
};

/** Normalise one client object, accepting snake_case or camelCase fields. */
export function parseClient(raw: unknown): SbClient | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id === undefined || r.id === null ? null : String(r.id);
  const email = str(r.email);
  if (!id || !email) return null;
  const contacts = r.contact_emails ?? r.contactEmails;
  const status = str(r.status);
  return {
    id,
    name: str(r.name) ?? email,
    email,
    contactEmails: Array.isArray(contacts) ? contacts.filter((e): e is string => typeof e === 'string') : [],
    status: status === 'past_due' || status === 'canceled' ? status : 'active',
    // SB Tracker sends mrr and estimatedMonthlyExpenses in cents.
    mrrCad: cents(r.mrr),
    renewalDate: day(r.renewsAt ?? r.renewal_date),
    estimatedCostCad: cents(r.estimatedMonthlyExpenses),
    freshbooksClientId: str(r.freshbooks_client_id ?? r.freshbooksClientId),
  };
}

function listFrom(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    for (const key of ['clients', 'data', 'items', 'results']) {
      if (Array.isArray(b[key])) return b[key] as unknown[];
    }
  }
  return [];
}

export function clientMatchesEmail(client: SbClient, email: string): boolean {
  const target = email.trim().toLowerCase();
  return [client.email, ...client.contactEmails].some((e) => e.trim().toLowerCase() === target);
}

/**
 * Every non-cancelled client whose primary or contact email matches.
 *
 * Sends `email=` so SB Tracker can filter once R1 ships, and checks the match
 * here as well, so it also works against today's unfiltered list.
 */
export async function findClientsByEmail(email: string): Promise<SbClient[]> {
  const matches: SbClient[] = [];
  let filter = true;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_LIMIT) });
    if (filter) params.set('email', email);
    let res: Response;
    try {
      res = await sbFetch(`/api/clients?${params}`);
    } catch (error) {
      // An API that doesn't know `email` yet may refuse it; scan unfiltered.
      if (filter && error instanceof SbTrackerError && error.status === 400) {
        filter = false;
        page -= 1;
        continue;
      }
      throw error;
    }
    if (res.status === 404) break;
    const rows = listFrom(await res.json());
    for (const row of rows) {
      const client = parseClient(row);
      if (client && client.status !== 'canceled' && clientMatchesEmail(client, email)) {
        matches.push(client);
      }
    }
    if (rows.length < PAGE_LIMIT) break;
  }
  return matches;
}

export async function getClient(id: string): Promise<SbClient | null> {
  const res = await sbFetch(`/api/clients/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  const body = await res.json();
  return parseClient((body as Record<string, unknown>)?.client ?? body);
}

/** Plan items (R2). Returns null while SB Tracker doesn't have the endpoint yet. */
export async function getClientExpenses(id: string): Promise<SbExpense[] | null> {
  const res = await sbFetch(`/api/clients/${encodeURIComponent(id)}/expenses`);
  if (res.status === 404) return null;
  return listFrom(await res.json()).flatMap((raw) => {
    if (!raw || typeof raw !== 'object') return [];
    const r = raw as Record<string, unknown>;
    if (r.id === undefined || r.id === null) return [];
    const amountCents = num(r.amount_cents ?? r.amountCents);
    return [
      {
        id: String(r.id),
        name: str(r.name) ?? 'Service',
        offeringId: str(r.offering_id ?? r.offeringId),
        amountCents,
        interval: (r.interval === 'year' ? 'year' : 'month') as SbExpense['interval'],
        quantity: num(r.quantity) ?? 1,
      },
    ];
  });
}

/** "$12.50/mo", or "Varies" for an unpriced item. */
export function formatExpensePrice(expense: SbExpense): string {
  if (expense.amountCents === null) return 'Varies';
  const qty = expense.quantity > 1 ? `${expense.quantity} × ` : '';
  return `${qty}${money(expense.amountCents / 100)}/${expense.interval === 'year' ? 'yr' : 'mo'}`;
}

/** Display name: the offering's name when the item maps to one. */
export function expenseLabel(expense: SbExpense): string {
  const id = expense.offeringId;
  if (!id) return expense.name;
  if (id === buildSprint.id) return buildSprint.name;
  for (const layer of layers) {
    const tier = layer.tiers.find((t) => t.id === id);
    if (tier) return `${layer.name} · ${tier.name}`;
  }
  return addons.find((a) => a.id === id)?.name ?? expense.name;
}

/** Map Client Expenses onto the offerings grid so the builder can start from them. */
export function planFromExpenses(expenses: SbExpense[]): CurrentPlan {
  const plan: CurrentPlan = {
    selection: {},
    sprint: false,
    addonIds: [],
    other: [],
    items: expenses,
    monthlyCad: 0,
    annualCad: 0,
  };
  for (const expense of expenses) {
    if (expense.amountCents !== null) {
      const amount = (expense.amountCents * expense.quantity) / 100;
      if (expense.interval === 'year') plan.annualCad += amount;
      else plan.monthlyCad += amount;
    }
    const id = expense.offeringId;
    const layer = id ? layers.find((l) => l.tiers.some((t) => t.id === id)) : undefined;
    if (layer && id) plan.selection[layer.id] = id;
    else if (id === buildSprint.id) plan.sprint = true;
    else if (id && addons.some((a) => a.id === id)) {
      if (!plan.addonIds.includes(id)) plan.addonIds.push(id);
    } else plan.other.push(expense);
  }
  return plan;
}

/**
 * The client and their current plan for a staff email. Never throws: if SB
 * Tracker is unreachable the request still goes through, marked unavailable.
 */
export async function loadClientContext(
  id: string,
): Promise<{ client: SbClient | null; current: CurrentPlan | null }> {
  try {
    const client = await getClient(id);
    const expenses = await getClientExpenses(id);
    return { client, current: expenses ? planFromExpenses(expenses) : null };
  } catch (error) {
    console.error('SB Tracker lookup failed:', error instanceof Error ? error.message : 'Unknown error');
    return { client: null, current: null };
  }
}
