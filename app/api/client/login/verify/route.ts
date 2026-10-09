import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import {
  checkRateLimit,
  forbiddenOriginResponse,
  getClientIp,
  isSameOrigin,
  isValidEmail,
  maskEmail,
  rateLimitResponse,
} from '@/lib/security';
import { MAX_CODE_ATTEMPTS, hashLoginCode, startClientSession } from '@/lib/clientSession';
import { getClient } from '@/lib/sbTracker';

const IP_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 };
const INVALID = { error: 'That code is invalid or has expired. Request a new one.' };

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) return forbiddenOriginResponse();

    const limit = checkRateLimit(`client-verify:${getClientIp(request)}`, IP_LIMIT);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

    const body = (await request.json().catch(() => null)) as { email?: unknown; code?: unknown } | null;
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Enter the 6-digit code from your email.' }, { status: 400 });
    }

    await initializeDatabase();
    const result = await query(
      `SELECT id, client_id, code_hash, attempts FROM client_login_codes
       WHERE email = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    const row = result.rows[0] as
      | { id: number; client_id: string; code_hash: string; attempts: number }
      | undefined;
    if (!row || row.attempts >= MAX_CODE_ATTEMPTS) {
      return NextResponse.json(INVALID, { status: 400 });
    }

    const expected = Buffer.from(row.code_hash, 'hex');
    const given = Buffer.from(hashLoginCode(email, code), 'hex');
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
      await query(`UPDATE client_login_codes SET attempts = attempts + 1 WHERE id = $1`, [row.id]);
      return NextResponse.json(INVALID, { status: 400 });
    }

    // Single use: only the request that flips used_at gets a session.
    const claimed = await query(
      `UPDATE client_login_codes SET used_at = NOW() WHERE id = $1 AND used_at IS NULL RETURNING id`,
      [row.id]
    );
    if (claimed.rowCount !== 1) return NextResponse.json(INVALID, { status: 400 });

    const client = await getClient(row.client_id);
    if (!client || client.status === 'canceled') {
      console.warn('[CLIENT LOGIN] Client no longer active for', maskEmail(email));
      return NextResponse.json(
        { error: 'We couldn’t find an active plan for this email. Please email help@tranmer.ca.' },
        { status: 403 }
      );
    }

    await startClientSession(email, client.id);
    console.log('[CLIENT LOGIN] Signed in', maskEmail(email));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const safeError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error verifying client login code:', safeError);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
