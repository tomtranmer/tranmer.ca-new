# SB Tracker API: requirements for the TWS client portal

The tranmer.ca client portal (`/web` → "Current clients") lets a client log in with a one-time code
sent to their email. It then shows their current plan and lets them send a change request.
tranmer.ca calls SB Tracker from its server with `Authorization: Bearer <SB_TRACKER_API_KEY>`. The key
never reaches the browser.

This document lists what SB Tracker needs to add to its existing external API, which has five
read-only GET endpoints. Everything below is also read-only, and all errors use the existing
`{ code, message }` shape.

## What tranmer.ca already uses as-is

| Endpoint | Used for |
| --- | --- |
| `GET /api/clients` | Finding the client whose email matches the login email (paged scan, `limit=100`) |
| `GET /api/clients/:id` | Name, status and renewal date on the account page; MRR and estimated cost in the staff email |

Fields read from the client object: `id`, `name`, `email`, `status`, `mrr` (cents), `renewsAt`
(ISO date or timestamp, shown as a date) and `estimatedMonthlyExpenses` (cents; TWS's own cost,
shown to staff only, never to the client). What the client pays comes from R2's item amounts.

Clients with status `canceled` can't log in. `active` and `past_due` can.

`portalUrl` (the client's `/portal/<token>` page) is shown as a "View in SB Tracker" link on the
account page, only to the logged-in client it belongs to, and only if it's an https URL. Make sure
`NEXT_PUBLIC_APP_URL` is set in SB Tracker, or the URL comes back as `undefined/portal/...` and the
link is hidden. The "Open most recent invoice (FreshBooks)" link comes from R5.

## R1. Look up a client by email (required)

```
GET /api/clients?email=<address>
```

- Exact match, case-insensitive, after trimming whitespace.
- Matches the client's primary email **and** any contact emails, including the contacts on the
  linked FreshBooks client (see R3). That way any billing contact on file can log in.
- Returns the normal paged shape with 0 or 1 clients. If more than one client matches, return all
  of them; tranmer.ca refuses the login and asks the person to email help@tranmer.ca.
- Add a `contact_emails: string[]` field to the client object (both list and `/:id`). This lets
  tranmer.ca confirm the match on its side.

**Why:** paging through every client on each login request is slow, and it can't see FreshBooks
contacts. tranmer.ca already sends `email=` and checks the results itself, so it works before and
after this ships. No change is needed on the tranmer.ca side.

## R2. Plan items from Client Expenses (required for the "current plan" view)

```
GET /api/clients/:id/expenses
```

Returns the client's **active recurring** Client Expenses, which are their plan items:

```json
{
  "items": [
    {
      "id": "exp_123",
      "name": "Hosting · E-commerce",
      "offering_id": "infra-ecommerce",
      "amount_cents": 7500,
      "currency": "CAD",
      "interval": "month",
      "quantity": 1,
      "started_on": "2026-03-01",
      "next_renewal_on": "2026-11-01"
    }
  ]
}
```

- `interval` is `month` or `year`.
- `amount_cents` is the line total for all `quantity` units per `interval` (4 IMAP mailboxes at
  $5 → `quantity: 4`, `amount_cents: 2000`).
- `offering_id` is a new optional field on a Client Expense, set from SB Tracker's admin UI. Valid
  values are the IDs in tranmer.ca's `lib/offerings.ts`:
  - Infrastructure: `infra-billboard`, `infra-ecommerce`, `infra-app`
  - Support: `support-none`, `support-minimal`, `support-full`
  - Builder Availability: `build-none`, `build-starter`, `build-maintenance`, `build-active`,
    `build-sprint`
  - Add-ons: `addon-domain`, `addon-email-imap`, `addon-email-gmail`, `addon-malware`,
    `addon-email-sending`, `addon-database`
- `amount_cents` may be `null` for unpriced items (usage-billed hosting such as Vercel or Azure,
  plugins). tranmer.ca shows these as "Varies".
- When `offering_id` is missing, tranmer.ca also matches an item whose name is exactly an
  offering's name. If nothing maps to an Infrastructure tier, it infers one: App hosting when the
  plan has App Database or Email Sending, otherwise Billboard for a hosting-like item (hosting,
  vercel, netlify, server, vps). Setting `offering_id` is still the reliable way.
- Add-ons the plan includes (Neon and Resend on App hosting or with an active build) show as
  "Included" and aren't counted in the total, whatever `amount_cents` says.
- Items with no `offering_id` are still returned. tranmer.ca lists them as "Other services" so the
  client sees everything they pay for.
- Ended or cancelled expenses are left out.
- API key only, like `/invoices` and `/usage`. `404 NOT_FOUND` if the client doesn't exist.

Until this ships, tranmer.ca shows the totals from `GET /api/clients/:id` and starts the plan
builder empty. Change requests still work.

## R3. FreshBooks link (required for R1's contact matching)

- Store `freshbooks_client_id` on the SB Tracker client.
- Sync each FreshBooks client's primary email and contact emails into `contact_emails` (on a
  schedule, or when the client is saved). FreshBooks becomes the source of truth for who is
  allowed to log in.
- Return `freshbooks_client_id` on the client object. tranmer.ca includes it in change-request
  emails so staff can find the client in FreshBooks.

**Why this lives in SB Tracker:** FreshBooks uses OAuth with rotating refresh tokens. Keeping that
in one system that's already an admin tool is simpler and safer than adding a second FreshBooks
integration to the public marketing site.

## R4. Future: update payment card (not yet built)

Planned for when SB Tracker's Stripe integration supports it:

```
POST /api/clients/:id/payment-method-session   { "return_url": "https://tranmer.ca/web/account" }
→ { "url": "https://billing.stripe.com/..." }
```

- Creates a Stripe Billing Portal session (or a hosted Checkout session in `setup` mode) for the
  client's Stripe customer, and returns its short-lived URL. Card details never touch
  tranmer.ca or SB Tracker.
- This is the first non-GET endpoint for the API key, so it needs its own scope or key. A
  read-only key shouldn't be able to call it.
- tranmer.ca shows the "Update payment card" button only when this endpoint exists. For now it
  shows "Coming soon".

## R5. Most recent FreshBooks invoice (for the account page link)

```
GET /api/clients/:id/latest-invoice
→ { "invoice_number": "1042", "url": "https://my.freshbooks.com/#/link/...", "issued_at": "2026-10-01" }
```

- For clients with a `freshbooks_client_id`: the newest non-draft invoice for that FreshBooks
  client (`GET /accounting/account/{accountId}/invoices/invoices?search[customerid]=<id>`, newest
  first, `per_page=1`).
- `url` is the invoice's FreshBooks share link
  (`GET .../invoices/invoices/{invoiceId}/share_link?share_method=share_link`), which opens the
  invoice without a FreshBooks login. Cache it; it doesn't change per invoice.
- `404 NOT_FOUND` if the client doesn't exist, has no FreshBooks link, or has no invoices.
- API key only. Needs the live FreshBooks OAuth connection described under R3.

The link is shown only to the logged-in client it belongs to, and only if `url` is https. Until
this ships, tranmer.ca gets a 404 and hides the link. If the call fails, the rest of the account
page still loads.

## Out of scope for SB Tracker

- Login codes, sessions and the change-request email all live on tranmer.ca.
- Change requests are emailed to help@tranmer.ca (cc help@helpdesk.tranmer.ca) and aren't written
  back to SB Tracker for now.
