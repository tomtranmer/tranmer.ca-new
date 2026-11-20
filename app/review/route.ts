import { NextRequest, NextResponse } from 'next/server';
import {
  REVIEW_EMAIL_COOKIE,
  REVIEW_EMAIL_COOKIE_MAX_AGE,
  emailFromLink,
  sanitizeSource,
} from '@/lib/reviewRequest';

/**
 * Newsletter entry point: /review?email=*|URL:EMAIL|*&src=newsletter-2026-11
 *
 * Moves the address into a short-lived cookie and redirects to /web/review,
 * so it never appears in the page URL that Google Analytics records. This
 * only sets a cookie; nothing is sent until the visitor confirms on the page.
 */
export async function GET(request: NextRequest) {
  const email = emailFromLink(request.nextUrl.searchParams.get('email'));
  const source = sanitizeSource(request.nextUrl.searchParams.get('src'));

  const target = new URL('/web/review', request.url);
  if (source) target.searchParams.set('src', source);

  const response = NextResponse.redirect(target, 303);
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  if (email) {
    response.cookies.set(REVIEW_EMAIL_COOKIE, email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/web/review',
      maxAge: REVIEW_EMAIL_COOKIE_MAX_AGE,
    });
  }
  return response;
}
