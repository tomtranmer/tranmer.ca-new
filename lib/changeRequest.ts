/**
 * Validation and email rendering for client portal change requests.
 *
 * Only the requested plan, notes and new email come from the browser. The
 * client's identity and current plan come from the session and SB Tracker.
 */
import {
  addons,
  annualTotalFor,
  buildSprint,
  includedAddonIds,
  layersBottomUp,
  money,
  formatAddonPrice,
  formatPrice,
  totalFor,
  type PlanState,
} from '@/lib/offerings';
import { escapeHtml, isValidEmail, sanitizeText } from '@/lib/security';
import { formatExpensePrice, type CurrentPlan, type SbClient } from '@/lib/sbTracker';

export const CHANGE_REQUEST_TO = 'help@tranmer.ca';
export const CHANGE_REQUEST_CC = 'help@helpdesk.tranmer.ca';
export const MAX_NOTES_LENGTH = 2000;

export type ChangeRequest = {
  plan: PlanState;
  notes: string;
  newEmail: string | null;
};

export function parseChangeRequest(
  body: unknown,
  currentEmail: string,
): { ok: true; request: ChangeRequest } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request' };
  const b = body as Record<string, unknown>;

  const rawSelection = (b.selection && typeof b.selection === 'object' ? b.selection : {}) as Record<
    string,
    unknown
  >;
  const plan: PlanState = { selection: {}, sprint: b.sprint === true, addonIds: [] };
  for (const layer of layersBottomUp) {
    const value = rawSelection[layer.id];
    if (value === undefined || value === null || value === '') continue;
    if (typeof value !== 'string' || !layer.tiers.some((t) => t.id === value)) {
      return { ok: false, error: `Unknown ${layer.name} option` };
    }
    plan.selection[layer.id] = value;
  }
  if (Array.isArray(b.addonIds)) {
    for (const id of b.addonIds) {
      if (typeof id !== 'string' || !addons.some((a) => a.id === id)) {
        return { ok: false, error: 'Unknown add-on' };
      }
      if (!plan.addonIds.includes(id)) plan.addonIds.push(id);
    }
  }

  const notes = sanitizeText(b.notes, MAX_NOTES_LENGTH);

  let newEmail: string | null = null;
  if (typeof b.newEmail === 'string' && b.newEmail.trim()) {
    if (!isValidEmail(b.newEmail)) return { ok: false, error: 'Please enter a valid new email address' };
    newEmail = b.newEmail.trim();
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      return { ok: false, error: 'The new email is the same as your current one' };
    }
  }

  const hasPlan = Object.keys(plan.selection).length > 0 || plan.sprint || plan.addonIds.length > 0;
  if (!hasPlan && !notes && !newEmail) {
    return { ok: false, error: 'Choose a plan change, add a note or request an email change' };
  }
  return { ok: true, request: { plan, notes, newEmail } };
}

/** Plain lines describing a plan, e.g. "Infrastructure: E-commerce ($75)". */
export function describePlan(plan: PlanState): string[] {
  const included = includedAddonIds(plan.selection, { sprint: plan.sprint });
  const lines = layersBottomUp.map((layer) => {
    if (plan.sprint && layer.id === 'build') return `${layer.name}: ${buildSprint.name} (${money(buildSprint.price)}/mo)`;
    const tier = layer.tiers.find((t) => t.id === plan.selection[layer.id]);
    return `${layer.name}: ${tier ? `${tier.name} (${formatPrice(tier)})` : 'No change / not selected'}`;
  });
  for (const addon of addons) {
    if (included.includes(addon.id)) lines.push(`Add-on: ${addon.name} (included)`);
    else if (plan.addonIds.includes(addon.id)) lines.push(`Add-on: ${addon.name} (${formatAddonPrice(addon)})`);
  }
  return lines;
}

export function planTotals(plan: PlanState): { monthly: number; annual: number; pending: number } {
  const included = includedAddonIds(plan.selection, { sprint: plan.sprint });
  const paid = plan.addonIds.filter((id) => !included.includes(id));
  const { known, pending } = totalFor(plan.selection, { sprint: plan.sprint, addonIds: paid });
  return { monthly: known, annual: annualTotalFor(paid), pending };
}

function list(lines: string[]): string {
  return `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
}

export function renderStaffEmail({
  sessionEmail,
  client,
  current,
  request,
}: {
  sessionEmail: string;
  client: SbClient | null;
  current: CurrentPlan | null;
  request: ChangeRequest;
}): { subject: string; html: string; text: string } {
  const name = client?.name ?? sessionEmail;
  const totals = planTotals(request.plan);
  const totalLine = `${money(totals.monthly)}/mo${totals.annual ? ` + ${money(totals.annual)}/yr` : ''}${
    totals.pending ? ` + ${totals.pending} item(s) priced on request` : ''
  }`;

  const clientLines = [
    `Name: ${name}`,
    `Logged in as: ${sessionEmail}`,
    `SB Tracker client ID: ${client?.id ?? 'unknown'}`,
    client?.freshbooksClientId ? `FreshBooks client ID: ${client.freshbooksClientId}` : null,
    client ? `Status: ${client.status}` : null,
    client?.renewalDate ? `Renewal date: ${client.renewalDate}` : null,
    client?.monthlyExpensesCad != null ? `Monthly client expenses: ${money(client.monthlyExpensesCad)}` : null,
  ].filter((l): l is string => !!l);

  const currentLines = current
    ? [
        ...describePlan(current),
        ...current.other.map(
          (e) => `Other: ${e.name} (${formatExpensePrice(e)})`,
        ),
      ]
    : ['Plan items not available from SB Tracker yet.'];

  const sections: [string, string[]][] = [
    ['Client', clientLines],
    ['Current plan (SB Tracker)', currentLines],
    ['Requested plan', [...describePlan(request.plan), `Estimated total: ${totalLine}`]],
  ];
  if (request.newEmail) {
    sections.push([
      'Email change requested',
      [
        `From: ${sessionEmail}`,
        `To: ${request.newEmail}`,
        'Confirm with the client before updating FreshBooks and SB Tracker.',
      ],
    ]);
  }
  if (request.notes) sections.push(['Notes from client', [request.notes]]);

  const subject = `Plan change request: ${sanitizeText(name, 100)}`;
  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5;color:#1e293b">
<h2>Plan change request</h2>
${sections.map(([title, lines]) => `<h3>${escapeHtml(title)}</h3>${list(lines)}`).join('\n')}
<p style="color:#64748b;font-size:13px">Sent from the tranmer.ca client portal. Reply to respond to the client.</p>
</body></html>`;
  const text = sections.map(([title, lines]) => `${title}\n${lines.map((l) => `- ${l}`).join('\n')}`).join('\n\n');
  return { subject, html, text };
}

export function renderClientConfirmation(request: ChangeRequest): { subject: string; html: string } {
  const lines = describePlan(request.plan);
  return {
    subject: 'We received your plan change request',
    html: `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5;color:#1e293b">
<p>Thanks, we've received your request and will be in touch shortly to confirm the details.</p>
<h3>What you asked for</h3>
${list(lines)}
${request.newEmail ? `<p>You also asked to change your email address to <strong>${escapeHtml(request.newEmail)}</strong>. We'll confirm with you before changing it.</p>` : ''}
${request.notes ? `<h3>Your notes</h3><p>${escapeHtml(request.notes)}</p>` : ''}
<p>If you didn't make this request, reply to this email right away.</p>
<p>TWS · <a href="mailto:help@tranmer.ca">help@tranmer.ca</a></p>
</body></html>`,
  };
}
