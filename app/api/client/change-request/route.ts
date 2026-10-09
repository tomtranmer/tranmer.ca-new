import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import {
  checkRateLimit,
  forbiddenOriginResponse,
  isSameOrigin,
  maskEmail,
  rateLimitResponse,
} from '@/lib/security';
import { createMailTransport } from '@/lib/mail';
import { getClientSession } from '@/lib/clientSession';
import {
  CHANGE_REQUEST_CC,
  CHANGE_REQUEST_TO,
  parseChangeRequest,
  renderClientConfirmation,
  renderStaffEmail,
} from '@/lib/changeRequest';
import { getClient, getClientExpenses, planFromExpenses, type CurrentPlan, type SbClient } from '@/lib/sbTracker';

const LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Email sending timeout')), 15000)),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) return forbiddenOriginResponse();

    const session = await getClientSession();
    if (!session) {
      return NextResponse.json({ error: 'Your session has expired. Please log in again.' }, { status: 401 });
    }

    const limit = checkRateLimit(`change-request:${session.clientId}`, LIMIT);
    if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

    const parsed = parseChangeRequest(await request.json().catch(() => null), session.email);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const changeRequest = parsed.request;

    const transporter = createMailTransport();
    if (!transporter) {
      console.error('SMTP configuration missing');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please email help@tranmer.ca.' },
        { status: 503 }
      );
    }

    // The current plan comes from SB Tracker, never from the browser. If it's
    // unreachable the request still goes through, marked as unavailable.
    let client: SbClient | null = null;
    let current: CurrentPlan | null = null;
    try {
      client = await getClient(session.clientId);
      const expenses = await getClientExpenses(session.clientId);
      current = expenses ? planFromExpenses(expenses) : null;
    } catch (error) {
      console.error('SB Tracker lookup failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    await initializeDatabase();
    const saved = await query(
      `INSERT INTO client_change_requests (client_id, email, requested_plan, notes, new_email)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        session.clientId,
        session.email,
        JSON.stringify(changeRequest.plan),
        changeRequest.notes || null,
        changeRequest.newEmail,
      ]
    );
    const requestId = saved.rows[0].id;

    const staff = renderStaffEmail({ sessionEmail: session.email, client, current, request: changeRequest });
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

    // Goes to the address on file, so the owner hears about any request made
    // in their name, including a request to move the account to a new email.
    try {
      const confirmation = renderClientConfirmation(changeRequest);
      await withTimeout(
        transporter.sendMail({
          from: process.env.SMTP_USER || 'help@tranmer.ca',
          to: session.email,
          replyTo: CHANGE_REQUEST_TO,
          ...confirmation,
        })
      );
    } catch (error) {
      console.error('Change request confirmation failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('[CHANGE REQUEST]', { id: requestId, email: maskEmail(session.email) });
    return NextResponse.json({ ok: true, requestId });
  } catch (error) {
    const safeError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error submitting change request:', safeError);
    return NextResponse.json(
      { error: 'We couldn’t send your request. Please try again or email help@tranmer.ca.' },
      { status: 500 }
    );
  }
}
