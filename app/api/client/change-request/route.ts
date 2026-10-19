import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';
import {
  checkRateLimit,
  forbiddenOriginResponse,
  isSameOrigin,
  maskEmail,
  rateLimitResponse,
} from '@/lib/security';
import { isMailConfigured, sendEmail } from '@/lib/mail';
import { getClientSession } from '@/lib/clientSession';
import {
  CHANGE_REQUEST_CC,
  CHANGE_REQUEST_TO,
  parseChangeRequest,
  renderClientConfirmation,
  renderStaffEmail,
} from '@/lib/changeRequest';
import { buildSprint, sprintNotBeforeLabel } from '@/lib/offerings';
import { loadClientContext } from '@/lib/sbTracker';

const LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

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

    if (!isMailConfigured()) {
      console.error('Email configuration missing');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please email help@tranmer.ca.' },
        { status: 503 }
      );
    }

    // The current plan comes from SB Tracker, never from the browser.
    const { client, current } = await loadClientContext(session.clientId);
    // Sold out means no new sprints; a client already on one can keep it.
    if (changeRequest.plan.sprint && buildSprint.soldOut && !current?.sprint) {
      const notBefore = sprintNotBeforeLabel();
      return NextResponse.json(
        { error: `The ${buildSprint.name} is sold out${notBefore ? ` (${notBefore.toLowerCase()})` : ''}.` },
        { status: 400 }
      );
    }

    await initializeDatabase();
    const saved = await query(
      `INSERT INTO client_change_requests (client_id, email, requested_plan, notes, new_email)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        session.clientId,
        session.email,
        JSON.stringify(
          changeRequest.monthlyBilling ? { ...changeRequest.plan, monthlyBilling: true } : changeRequest.plan
        ),
        changeRequest.notes || null,
        changeRequest.newEmail,
      ]
    );
    const requestId = saved.rows[0].id;

    const staff = renderStaffEmail({ sessionEmail: session.email, client, current, request: changeRequest });
    await sendEmail({
      tag: 'change-request',
      idempotencyKey: `change-request-${requestId}`,
      to: CHANGE_REQUEST_TO,
      cc: CHANGE_REQUEST_CC,
      replyTo: session.email,
      subject: `${staff.subject} (#${requestId})`,
      html: staff.html,
      text: staff.text,
    });
    await query(`UPDATE client_change_requests SET emailed_at = NOW() WHERE id = $1`, [requestId]);

    // Goes to the address on file, so the owner hears about any request made
    // in their name, including a request to move the account to a new email.
    try {
      const confirmation = renderClientConfirmation(changeRequest);
      await sendEmail({
        tag: 'change-confirmation',
        idempotencyKey: `change-confirmation-${requestId}`,
        to: session.email,
        replyTo: CHANGE_REQUEST_TO,
        ...confirmation,
      });
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
