# web.tranmer.ca refresh: 3x3 offering grid

Draft scaffold for refocusing the TWS one-pager around three stacked choices.
The live site at web.tranmer.ca isn't served from this repo, so the drafts
live at `/services/*` here (marked `noindex`) until a direction is chosen.

## The model

| Level | Layer | Options |
| --- | --- | --- |
| 3 (top) | Builder Availability | On request (quoted) · Starter $100/mo · Maintenance $500/mo · Active $1,000/mo |
| 2 | TWS Support | Self-managed (BYO tech) · Minimal (email on-call) · Full (content mgmt + training) |
| 1 (base) | Infrastructure | Web · Billboard · Web · eCommerce · App · Integrated Hosting |
| Add-on | Build Sprint | $2,500/mo, occasional full-time month |

All copy and pricing lives in `lib/offerings.ts`. Every design reads from it.

## Design options

| | Route | Idea | Best for |
| --- | --- | --- | --- |
| A | `/services/stack-builder` | Interactive configurator, one pick per layer, live monthly total | Self-serve visitors; doubles as a quote request |
| B | `/services/layers` | Coloured bands stacked like an architecture diagram, foundation widest | Explaining the model at a glance; most "brand" |
| C | `/services/matrix` | Comparison grid + three example bundles (Launch / Grow / Partner) | Scannable pricing; nudges toward packages |

Screenshots: `stack-builder.png`, `stack-builder-mobile.png`, `layers.png`, `matrix.png`, `matrix-dark.png`.

## Open decisions

1. **Prices for infrastructure and support tiers.** Shown as "TBD" (`TODO(pricing)` in `lib/offerings.ts`).
2. **Build has 4 options, not 3.** "On request" sits alongside the three paid tiers. Keep it as a 4th card, or move it to a footnote so the grid stays a strict 3x3?
3. **Sprint pricing unit.** $2,500 is labelled "/mo". Is it billed per sprint month on top of the plan, or does it replace the builder tier that month?
4. **Final home.** Ship on this app at `/services` and point web.tranmer.ca at it, or port the chosen design to the web.tranmer.ca codebase?
5. **CTA.** Currently `mailto:help@tranmer.ca`. Could become a form posting the selected stack (like the existing pre-booking API) or a link to booking.tranmer.ca.

## Next steps

1. Pick a design (or mix, e.g. B's visuals with A's interactivity).
2. Fill in the TBD prices.
3. Remove the draft switcher bar from `components/services/ServicesShell.tsx`, drop `noindex`, and wire the CTA.
