/**
 * "Get my 2027 review" requests, sent from the client newsletter.
 *
 * The newsletter links to /review?email=..., which stores the address in a
 * short-lived cookie and redirects to /web/review, so the address never sits
 * in a page URL that analytics records. Nothing is sent until the visitor
 * presses the button on that page: email security scanners open links in
 * emails automatically, so a link that sent on load would send phantom
 * requests.
 *
 * The form can't prove the visitor owns the address, so the confirmation
 * email only goes to addresses already on file in SB Tracker, and it never
 * repeats the visitor's own text. That way the form can't be used to send
 * arbitrary content to arbitrary people.
 */
import { escapeHtml, isValidEmail, sanitizeText } from '@/lib/security';
import { clientSections, renderSections, type Section } from '@/lib/changeRequest';
import type { CurrentPlan, SbClient } from '@/lib/sbTracker';
import { MAX_REVIEW_NOTES, REVIEW_TOPICS, type ReviewTopicId } from '@/lib/reviewTopics';

export const REVIEW_REQUEST_TO = 'help@tranmer.ca';
export const REVIEW_REQUEST_CC = 'claude@tranmer.ca';

/** Cookie that carries the newsletter address from /review to /web/review. */
export const REVIEW_EMAIL_COOKIE = 'tws_review_email';
export const REVIEW_EMAIL_COOKIE_MAX_AGE = 60 * 60; // one hour

export { MAX_REVIEW_NOTES, REVIEW_TOPICS, type ReviewTopicId } from '@/lib/reviewTopics';

export type ReviewRequest = {
  email: string;
  name: string;
  website: string;
  topics: ReviewTopicId[];
  notes: string;
  /** Where the request came from, e.g. "newsletter-2026-11". Letters, numbers and dashes only. */
  source: string;
};

export function topicLabel(id: ReviewTopicId): string {
  return REVIEW_TOPICS.find((t) => t.id === id)?.label ?? id;
}

/** The address from the newsletter link, or null if it isn't a usable email. */
export function emailFromLink(value: string | string[] | null | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const trimmed = raw.trim();
  return isValidEmail(trimmed) ? trimmed.toLowerCase() : null;
}

export function sanitizeSource(value: unknown): string {
  return sanitizeText(value, 50).replace(/[^A-Za-z0-9-]/g, '');
}

export function parseReviewRequest(
  body: unknown,
): { ok: true; request: ReviewRequest } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request' };
  const b = body as Record<string, unknown>;

  if (!isValidEmail(b.email)) return { ok: false, error: 'Please enter a valid email address' };
  const email = (b.email as string).trim().toLowerCase();

  const topics: ReviewTopicId[] = [];
  if (b.topics !== undefined) {
    if (!Array.isArray(b.topics)) return { ok: false, error: 'Invalid topics' };
    for (const id of b.topics) {
      const topic = REVIEW_TOPICS.find((t) => t.id === id);
      if (!topic) return { ok: false, error: 'Unknown topic' };
      if (!topics.includes(topic.id)) topics.push(topic.id);
    }
  }

  return {
    ok: true,
    request: {
      email,
      name: sanitizeText(b.name, 100),
      website: sanitizeText(b.website, 200),
      topics,
      notes: sanitizeText(b.notes, MAX_REVIEW_NOTES),
      source: sanitizeSource(b.source),
    },
  };
}

/** Email to TWS staff, with what SB Tracker knows about the client when the address matches. */
export function renderReviewStaffEmail({
  request,
  matches,
  client,
  current,
}: {
  request: ReviewRequest;
  /** Every SB Tracker client whose email matches; empty if none, or if the lookup failed. */
  matches: SbClient[];
  /** The single matching client, with plan details, when there is exactly one. */
  client: SbClient | null;
  current: CurrentPlan | null;
}): { subject: string; html: string; text: string } {
  const sections: Section[] = [];

  if (client) {
    sections.push(...clientSections(request.email, client, current, 'Requested by'));
  } else if (matches.length > 1) {
    sections.push([
      'Client',
      [
        `Requested by: ${request.email}`,
        `This email matches ${matches.length} clients in SB Tracker: ${matches.map((c) => c.name).join(', ')}.`,
        'Confirm which account the review is for.',
      ],
    ]);
  } else {
    sections.push([
      'Client',
      [
        `Requested by: ${request.email}`,
        'Not found in SB Tracker. It may be a contact who isn’t on file yet, or a new prospect. No confirmation email was sent.',
      ],
    ]);
  }

  const details = [
    request.name ? `Name: ${request.name}` : null,
    request.website ? `Website: ${request.website}` : null,
    `Topics: ${request.topics.length ? request.topics.map(topicLabel).join(', ') : 'none selected'}`,
    request.source ? `Source: ${request.source}` : null,
  ].filter((l): l is string => !!l);
  sections.push(['Review request', details]);
  if (request.notes) sections.push(['Notes from client', [request.notes]]);

  const who = sanitizeText(client?.name || request.name || request.email, 100);
  return { subject: `2027 review request: ${who}`, ...renderSections('2027 review request', sections) };
}

/**
 * Confirmation to the client. Fixed wording only: nothing the visitor typed
 * is repeated, because the form can't verify they own the address.
 */
export function renderReviewConfirmation(): { subject: string; html: string; text: string } {
  const paragraphs = [
    'Thank you for requesting a 2027 review. We’ve received it and will look over your hosting, domains, email and backups, then be in touch with our recommendations.',
    'There’s no charge and no obligation.',
    'If you didn’t make this request, you can ignore this email or reply to let us know.',
  ];
  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5;color:#1e293b">
${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n')}
<p>Tranmer Web Services · <a href="mailto:help@tranmer.ca">help@tranmer.ca</a></p>
</body></html>`;
  const text = `${paragraphs.join('\n\n')}\n\nTranmer Web Services · help@tranmer.ca`;
  return { subject: 'We received your 2027 review request', html, text };
}
