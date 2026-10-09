import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import {
  checkRateLimit,
  forbiddenOriginResponse,
  isSameOrigin,
  maskEmail,
  rateLimitResponse,
  sanitizeText,
} from '@/lib/security';
import { createMailTransport, withTimeout } from '@/lib/mail';
import { getClientSession } from '@/lib/clientSession';
import {
  CHANGE_REQUEST_CC,
  CHANGE_REQUEST_TO,
  MAX_NOTES_LENGTH,
  renderCancellationConfirmation,
  renderCancellationEmail,
} from '@/lib/changeRequest';
import { loadClientContext } from '@/lib/sbTracker';

const LIMIT = { limit: 3, windowMs: 60 * 60 * 1000 };

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) return forbiddenOriginResponse();

    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: 'Your session has expired. Please log in again.' }, { status: 401 });
    }

    const limit = checkRateLimit(`cancel-request:${session.clientId}`, LIMIT);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

    const body = (await request.json().catch(() => null)) as { reason?: unknown; confirm?: unknown } | null;
    if (body?.confirm !== true) {
      return NextResponse.json({ error: 'Please confirm the cancellation.' }, { status: 400 });
    }
    const reason = sanitizeText(body.reason, MAX_NOTES_LENGTH);

    const transporter = createMailTransport();
    if (!transporter) {
      console.error('SMTP configuration missing');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please email help@tranmer.ca.' },
        { status: 503 }
      );
    }

    const { client, current } = await loadClientContext(session.clientId);

    await initializeDatabase();
    const saved = await query(
      `INSERT INTO client_change_requests (client_id, email, kind, requested_plan, notes)
       VALUES ($1, $2, 'cancel', '{}'::jsonb, $3) RETURNING id`,
      [session.clientId, session.email, reason || null]
    );
    const requestId = saved.rows[0].id;

    const staff = renderCancellationEmail({ sessionEmail: session.email, client, current, reason });
    await withTimeout(
      transporter.sendMail({
        from: process.env.SMTP_USER || 'help@tranmer.ca',
        to: CHANGE_REQUEST_TO,
        cc: CHANGE_REQUEST_CC,
        replyTo: session.email,
        subject: `${staff.subject} (#${requestId})`,
        html: staff.html,
        text: staff.text,
      })
    );
    await query(`UPDATE client_change_requests SET emailed_at = NOW() WHERE id = $1`, [requestId]);

    try {
      await withTimeout(
        transporter.sendMail({
          from: process.env.SMTP_USER || 'help@tranmer.ca',
          to: session.email,
          replyTo: CHANGE_REQUEST_TO,
          ...renderCancellationConfirmation(reason),
        })
      );
    } catch (error) {
      console.error('Cancellation confirmation failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('[CANCEL REQUEST]', { id: requestId, email: maskEmail(session.email) });
    return NextResponse.json({ ok: true, requestId });
  } catch (error) {
    const safeError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error submitting cancellation request:', safeError);
    return NextResponse.json(
      { error: 'We couldn’t send your request. Please try again or email help@tranmer.ca.' },
      { status: 500 }
    );
  }
}
