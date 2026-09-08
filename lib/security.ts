/**
 * Shared security helpers for the public API routes.
 *
 * These routes are unauthenticated and trigger outbound email, so every value
 * that reaches an email body, a log line or the database is validated, length
 * capped and HTML escaped before use.
 */

import { NextResponse } from 'next/server';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape a value for safe interpolation into an HTML email body.
 * Never interpolate raw user input into HTML - always wrap it in this.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * Practical email address pattern. Deliberately stricter than RFC 5322: it
 * rejects the characters that enable HTML injection ("<", ">", quotes, "/")
 * and header injection (CR/LF), which a permissive pattern would allow.
 */
const EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  const [localPart] = trimmed.split('@');
  if (localPart.length > 64) return false;
  return EMAIL_PATTERN.test(trimmed);
}

/**
 * Coerce an untrusted value to a trimmed, length capped, control-character
 * free string. The result is still untrusted - escape it before rendering.
 */
export function sanitizeText(value: unknown, maxLength = 1000): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeStringList(
  value: unknown,
  { maxItems = 20, maxLength = 200 }: { maxItems?: number; maxLength?: number } = {}
): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => sanitizeText(item, maxLength))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
}

/** Mask an email for logging: "someone@example.com" becomes "som***@example.com". */
export function maskEmail(value: unknown): string {
  if (typeof value !== 'string' || !value.includes('@')) return 'unknown';
  const [localPart, domain] = value.split('@');
  return `${localPart.slice(0, 3)}***@${domain}`;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0].trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

type Bucket = { count: number; resetTime: number };

/**
 * In-memory fixed-window rate limiter.
 *
 * State is per serverless instance and resets on cold start, so this blunts
 * casual abuse but is not a hard guarantee. A platform level rule (Vercel WAF)
 * or a shared store is still required for strong limits.
 */
const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

function pruneExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetTime) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetTime) {
    if (buckets.size >= MAX_TRACKED_KEYS) pruneExpired(now);
    buckets.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetTime - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test helper: drop all rate limit state. */
export function resetRateLimits(): void {
  buckets.clear();
}

export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
  );
}

/**
 * Reject cross-site browser submissions. A missing Origin header (curl, server
 * to server) is allowed through and left to the rate limiter; a present but
 * mismatched Origin is a cross-site post and is refused.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const requestHost = request.headers.get('host') ?? new URL(request.url).host;
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

export function forbiddenOriginResponse(): NextResponse {
  return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
}
