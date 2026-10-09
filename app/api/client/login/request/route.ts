import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { query, initializeDatabase } from '@/lib/db';
import {
  checkRateLimit,
  escapeHtml,
  forbiddenOriginResponse,
  getClientIp,
  isSameOrigin,
  isValidEmail,
  maskEmail,
  rateLimitResponse,
} from '@/lib/security';
import { createMailTransport } from '@/lib/mail';
import { CODE_TTL_MINUTES, generateLoginCode, hashLoginCode } from '@/lib/clientSession';
import { findClientsByEmail, isSbTrackerConfigured } from '@/lib/sbTracker';

const IP_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };
const EMAIL_LIMIT = { limit: 3, windowMs: 15 * 60 * 1000 };
// Database backstop, since the in-memory limits are per instance.
const MAX_CODES_PER_HOUR = 5;

// The same answer whether or not the email belongs to a client, so this
// endpoint can't be used to find out who is a client.
const SENT = { ok: true, message: 'If that email is on file, a code is on its way.' };

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) return forbiddenOriginResponse();

    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const ipLimit = checkRateLimit(`client-login:${getClientIp(request)}`, IP_LIMIT);
    if (!ipLimit.allowed) return rateLimitResponse(ipLimit.retryAfterSeconds);

    const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const emailLimit = checkRateLimit(`client-login-email:${email}`, EMAIL_LIMIT);
    if (!emailLimit.allowed) return rateLimitResponse(emailLimit.retryAfterSeconds);

    const transporter = createMailTransport();
    if (!transporter || !isSbTrackerConfigured()) {
      console.error('Client login unavailable: SMTP or SB Tracker not configured');
      return NextResponse.json(
        { error: 'Client login is temporarily unavailable. Please email help@tranmer.ca.' },
        { status: 503 }
      );
    }

    await initializeDatabase();
    const recent = await query(
      `SELECT COUNT(*) AS count FROM client_login_codes
       WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [email]
    );
    if (parseInt(recent.rows[0].count, 10) >= MAX_CODES_PER_HOUR) {
      console.warn('Client login code cap reached for', maskEmail(email));
      return NextResponse.json(SENT);
    }

    const clients = await findClientsByEmail(email);
    if (clients.length !== 1) {
      console.log(`[CLIENT LOGIN] ${clients.length} clients matched`, maskEmail(email));
      return NextResponse.json(SENT);
    }

    const code = generateLoginCode();
    // A new code replaces any earlier unused one.
    await query(
      `UPDATE client_login_codes SET used_at = NOW() WHERE email = $1 AND used_at IS NULL`,
      [email]
    );
    await query(
      `INSERT INTO client_login_codes (email, client_id, code_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + make_interval(mins => $4))`,
      [email, clients[0].id, hashLoginCode(email, code), CODE_TTL_MINUTES]
    );

    await Promise.race([
      transporter.sendMail({
        from: process.env.SMTP_USER || 'help@tranmer.ca',
        to: email,
        subject: `Your TWS login code: ${code}`,
        text: `Your TWS client login code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.\n\nIf you didn't ask for this, you can ignore this email.`,
        html: `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b">
<p>Your TWS client login code is:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:8px;font-family:monospace">${escapeHtml(code)}</p>
<p>It expires in ${CODE_TTL_MINUTES} minutes. If you didn't ask for this, you can ignore this email.</p>
</body></html>`,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email sending timeout')), 15000)),
    ]);

    console.log('[CLIENT LOGIN] Code sent to', maskEmail(email));
    return NextResponse.json(SENT);
  } catch (error) {
    const safeError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending client login code:', safeError);
    return NextResponse.json(
      { error: 'We couldn’t send a code right now. Please try again shortly.' },
      { status: 500 }
    );
  }
}
