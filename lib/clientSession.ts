/**
 * Client portal sessions and one-time login codes.
 *
 * Sessions are a signed (not encrypted) cookie: base64url(JSON) + "." +
 * HMAC-SHA256. The payload only holds the login email and SB Tracker client
 * id, which the client already knows. Login codes are stored as HMACs, never
 * in plain text.
 */
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'tws_client_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
export const CODE_TTL_MINUTES = 10;
export const MAX_CODE_ATTEMPTS = 5;

export type ClientSession = { email: string; clientId: string; exp: number };

function secret(): string {
  const value = process.env.CLIENT_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('CLIENT_SESSION_SECRET must be set to at least 32 characters');
  }
  return value;
}

function hmac(data: string): Buffer {
  return createHmac('sha256', secret()).update(data).digest();
}

export function signSession(session: ClientSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${hmac(payload).toString('base64url')}`;
}

export function verifySession(token: string | undefined, now = Date.now()): ClientSession | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = hmac(payload);
  const given = Buffer.from(signature, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as ClientSession;
    if (typeof session.email !== 'string' || typeof session.clientId !== 'string') return null;
    if (typeof session.exp !== 'number' || session.exp * 1000 <= now) return null;
    return session;
  } catch {
    return null;
  }
}

export function generateLoginCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/** Bound to the email so a code can't be replayed for another address. */
export function hashLoginCode(email: string, code: string): string {
  return hmac(`login-code:${email.toLowerCase()}:${code}`).toString('hex');
}

export async function getClientSession(): Promise<ClientSession | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function startClientSession(email: string, clientId: string): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession({ email, clientId, exp }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endClientSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
