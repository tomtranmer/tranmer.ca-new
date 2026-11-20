import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { query, initializeDatabase } from '@/lib/db';
import {
  checkRateLimit,
  forbiddenOriginResponse,
  getClientIp,
  isSameOrigin,
  maskEmail,
  rateLimitResponse,
} from '@/lib/security';
import { isMailConfigured, sendEmail } from '@/lib/mail';
import {
  findClientsByEmail,
  isSbTrackerConfigured,
  loadClientContext,
  type CurrentPlan,
  type SbClient,
} from '@/lib/sbTracker';
import {
  REVIEW_REQUEST_CC,
  REVIEW_REQUEST_TO,
  parseReviewRequest,
  renderReviewConfirmation,
  renderReviewStaffEmail,
} from '@/lib/reviewRequest';

const IP_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };
const EMAIL_LIMIT = { limit: 3, windowMs: 24 * 60 * 60 * 1000 };

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) return forbiddenOriginResponse();

    const verification = await checkBotId();
    if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const ipLimit = checkRateLimit(`review-request:ip:${getClientIp(request)}`, IP_LIMIT);
    if (!ipLimit.allowed) return rateLimitResponse(ipLimit.retryAfterSeconds);

    const parsed = parseReviewRequest(await request.json().catch(() => null));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const review = parsed.request;

    const emailLimit = checkRateLimit(`review-request:email:${review.email}`, EMAIL_LIMIT);
    if (!emailLimit.allowed) return rateLimitResponse(emailLimit.retryAfterSeconds);

    if (!isMailConfigured()) {
      console.error('Email configuration missing');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please email help@tranmer.ca.' },
        { status: 503 }
      );
    }

    // Best effort: if SB Tracker is down, the request still reaches staff.
    let matches: SbClient[] = [];
    let client: SbClient | null = null;
    let current: CurrentPlan | null = null;
    if (isSbTrackerConfigured()) {
      try {
        matches = await findClientsByEmail(review.email);
      } catch (error) {
        console.error('SB Tracker lookup failed:', error instanceof Error ? error.message : 'Unknown error');
      }
      if (matches.length === 1) {
        ({ client, current } = await loadClientContext(matches[0].id));
        client ??= matches[0];
      }
    }

    // Saved for the record, but a database problem shouldn't stop the email.
    let requestId: number | null = null;
    try {
      await initializeDatabase();
      const saved = await query(
        `INSERT INTO client_review_requests (email, client_id, name, website, topics, notes, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          review.email,
          client?.id ?? null,
          review.name || null,
          review.website || null,
          JSON.stringify(review.topics),
          review.notes || null,
          review.source || null,
        ]
      );
      requestId = saved.rows[0].id;
    } catch (error) {
      console.error('Saving review request failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    const key = requestId ?? randomUUID();

    const staff = renderReviewStaffEmail({ request: review, matches, client, current });
    await sendEmail({
      tag: 'review-request',
      idempotencyKey: `review-request-${key}`,
      to: REVIEW_REQUEST_TO,
      cc: REVIEW_REQUEST_CC,
      replyTo: review.email,
      subject: requestId ? `${staff.subject} (#${requestId})` : staff.subject,
      html: staff.html,
      text: staff.text,
    });
    if (requestId) {
      await query(`UPDATE client_review_requests SET emailed_at = NOW() WHERE id = $1`, [requestId]).catch(
        (error: unknown) =>
          console.error('Marking review request emailed failed:', error instanceof Error ? error.message : 'Unknown error')
      );
    }

    // Only addresses on file get a confirmation, so the form can't be used to
    // email strangers. A failure here doesn't fail the request.
    if (matches.length > 0) {
      try {
        await sendEmail({
          tag: 'review-confirmation',
          idempotencyKey: `review-confirmation-${key}`,
          to: review.email,
          replyTo: REVIEW_REQUEST_TO,
          ...renderReviewConfirmation(),
        });
      } catch (error) {
        console.error('Review confirmation failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log('[REVIEW REQUEST]', { id: requestId, email: maskEmail(review.email), known: matches.length > 0 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error submitting review request:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'We couldn’t send your request. Please try again or email help@tranmer.ca.' },
      { status: 500 }
    );
  }
}
