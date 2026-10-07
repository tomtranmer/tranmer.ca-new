# Security audit: October 2026

Scope: the whole public repo on `main` (commit 097aef3) and its full git
history. Covered: API routes, shared libs, client components, service worker,
config and headers, CI, dependencies, committed secrets and personal data.

Fixes are on the `recommended-fixes` branch.

## Findings

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| 1 | **Critical** | `next@16.3.0` has unauthenticated RCE advisories, including one in the Image Optimizer, which this site uses (`next/image`). | Fixed: upgraded to 16.4.0 |
| 2 | **High** | `nodemailer@9.0.5` has several advisories (address-parser DoS, recipient-domain validation bypass, TLS servername reuse). | Fixed: upgraded to 10.0.16 (only breaking change: requires Node 20+) |
| 3 | **High** | BotID runs in the browser for all three form endpoints, but the server only checked it on `/api/submit-hosting-prebooking`. `/api/submit-referral`, the route that emails addresses the caller chooses, accepted scripted requests. | Fixed: `checkBotId()` added to the referral and survey routes |
| 4 | **Medium** | The referral form can be used to make TWS email any address. The per-IP limit lives in memory per serverless instance, so rotating IPs or hitting cold instances gets around it, and naming a new "referrer" each time let one victim be emailed repeatedly. | Fixed: one intro per address per 30 days, plus a global cap of 50 referral emails/day (database-backed). Held referrals are still saved, and the response doesn't reveal that they were held. |
| 5 | **Medium** | The referral route's SMTP transport used STARTTLS without `requireTLS`, so a downgraded connection could send the SMTP password in plaintext. Each route also had its own TLS defaults. | Fixed: shared `lib/mail.ts` (implicit TLS by default, `requireTLS` otherwise) used by all three routes |
| 6 | Medium | `sharp@0.35.3` (libheif/librsvg advisories) and `source-map-js@1.2.1` (build-time DoS). | Fixed: sharp 0.35.5, source-map-js 1.2.2 |
| 7 | Low | Service worker served its cached `/` indefinitely, so returning visitors could keep seeing an old homepage after a deploy, including one that carries a fix. | Fixed: page loads are network-first; the cache is only an offline fallback. Non-GET and cross-origin requests are left alone. |
| 8 | Low | CI workflow ran with the repo's default `GITHUB_TOKEN` permissions. | Fixed: `permissions: contents: read` |
| 9 | Low | Docs named the SMTP host and login username. No password was committed. | Fixed: replaced with placeholders. Make sure that mailbox has a strong, unique password. |
| 10 | Low | `X-Powered-By: Next.js` header; no explicit HSTS. | Fixed: header disabled; `Strict-Transport-Security: max-age=63072000` added (without `includeSubDomains`, since not every `*.tranmer.ca` subdomain has been checked) |
| 11 | Low | Schema setup SQL ran on every referral request, which also means the app's database user needs `CREATE` rights. | Partly fixed: runs once per instance. Recommended: create the table once, then give the app user only `SELECT`/`INSERT`. |
| 12 | Low | `vitest@4.1.10` advisory (dev only). CI also tested on Node 20, which reached end of life in April 2026. | Fixed: vitest 5.0.3; CI now runs Node 22 and 24 (vitest 5 needs 22.12+) |
| 13 | Info | `braces` (via `eslint-config-next`): dev-only lint dependency, no patched release yet. | Accepted; recheck later |

## Checked and fine

- **Secrets:** no keys, tokens, passwords, connection strings or `.env`/`.pem` files anywhere in the 113 commits on any branch. Every hit is a placeholder or lockfile hash.
- **Personal data:** no customer emails, phone numbers, addresses or survey responses committed. Image files have no EXIF/GPS data. `public/` holds no backups, dumps or source maps.
- **Injection:** every user value placed in email HTML goes through `escapeHtml`. SQL is fully parameterised. Email validation rejects CR/LF, quotes and `<>`, which blocks header and HTML injection.
- **XSS:** the only `dangerouslySetInnerHTML` is a static service-worker registration script. URL query values only prefill form inputs, which React escapes.
- **Cross-site posts:** a mismatched `Origin` header gets a 403. Clickjacking is blocked (`X-Frame-Options`, `frame-ancestors`).
- **Logging:** email addresses are masked, and only the error message is logged, never the full error object.
- **Database TLS:** certificates are verified for every non-local host.
- **Client IP:** `x-forwarded-for` is trusted, which is safe on Vercel because Vercel overwrites it.

## Recommended follow-ups (not in this branch)

1. **Vercel:** add a WAF rate-limit rule for `/api/*`, a stronger limit than the in-memory one. Confirm BotID/OIDC is enabled for the project, because the referral and survey routes now depend on it. Consider Deployment Protection for preview URLs.
2. **Content-Security-Policy:** add a full CSP, starting in `Report-Only` mode because of Google Analytics and Next.js inline scripts.
3. **Database:** give the app's database user only `SELECT`/`INSERT` on `referrals` (see #11).
4. **GitHub:** turn on Dependabot alerts and secret scanning, and protect `main`.
5. **Testimonials:** `docs/email-newsletter-2-reminder-social-proof.md` and `docs/mailchimp-campaign-templates.md` quote "Sarah M.", "James T." and "Rachel L.". If these are placeholders, mark them so before any send, because invented testimonials carry advertising-law risk.
