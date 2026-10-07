# web.tranmer.ca refresh: 3x3 offering grid

The TWS one-pager now lives at **tranmer.ca/web** (`app/web/page.tsx`).
Point the web.tranmer.ca domain at it when ready.

## The model

| Level | Layer | Options |
| --- | --- | --- |
| 3 (top) | Builder Availability | On request (quoted) · Starter $100/mo · Maintenance $500/mo · Active $1,000/mo |
| 2 | TWS Support | Self-managed (BYO tech) · Minimal (email on-call, TBD) · Full (content mgmt + training, TBD) |
| 1 (base) | Infrastructure | Web · Billboard $25/mo · Web · eCommerce $25/mo · App · Integrated Hosting $25/mo |
| Upgrade | Build Sprint | $2,500/mo; replaces the build tier for the month it's booked |

All copy and pricing lives in `lib/offerings.ts`.

## Design

Interactive configurator (`components/web/StackBuilder.tsx`): one pick per
layer, a live monthly total, and a "Request this plan" email pre-filled with
the selection. Card styling escalates with each tier's rank in its layer
(`premiumRank`): plain → sky gradient → indigo/violet gradient → dark
"Premium" card with gold border and glow. The Build Sprint is the most
premium card on the page.

Screenshots: `web-light.png`, `web-sprint.png`, `web-dark.png`, `web-mobile.png`.

## Still open

- Prices for Minimal and Full Support (`TODO(pricing)` in `lib/offerings.ts`).
- Infrastructure is $25 across all three tiers for now; adjust per tier as needed.
- CTA is email for now; could later post to a form or booking.tranmer.ca.
