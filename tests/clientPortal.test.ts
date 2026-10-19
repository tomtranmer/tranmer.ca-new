import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  generateLoginCode,
  hashLoginCode,
  signSession,
  verifySession,
} from '../lib/clientSession'
import {
  clientMatchesEmail,
  findClientsByEmail,
  formatExpensePrice,
  getClientExpenses,
  getLatestInvoice,
  parseClient,
  planFromExpenses,
  type SbExpense,
} from '../lib/sbTracker'
import { renderLoginCodeEmail } from '../lib/loginCodeEmail'
import { parseChangeRequest, planTotals, renderCancellationEmail, renderStaffEmail, type ChangeRequest } from '../lib/changeRequest'
import { sprintNotBeforeLabel } from '../lib/offerings'

beforeAll(() => {
  process.env.CLIENT_SESSION_SECRET = 'test-secret-that-is-at-least-32-characters-long'
})

const future = () => Math.floor(Date.now() / 1000) + 3600

describe('client sessions', () => {
  it('round-trips a signed session', () => {
    const session = { email: 'a@example.com', clientId: '42', exp: future() }
    expect(verifySession(signSession(session))).toEqual(session)
  })

  it('rejects a tampered payload', () => {
    const token = signSession({ email: 'a@example.com', clientId: '42', exp: future() })
    const [, sig] = token.split('.')
    const forged = Buffer.from(JSON.stringify({ email: 'a@example.com', clientId: '43', exp: future() })).toString('base64url')
    expect(verifySession(`${forged}.${sig}`)).toBeNull()
  })

  it('rejects an expired session and junk tokens', () => {
    const token = signSession({ email: 'a@example.com', clientId: '42', exp: Math.floor(Date.now() / 1000) - 1 })
    expect(verifySession(token)).toBeNull()
    expect(verifySession('nope')).toBeNull()
    expect(verifySession(undefined)).toBeNull()
  })
})

describe('login code email', () => {
  it('puts the code in the subject, preheader, body and plain text', () => {
    const email = renderLoginCodeEmail('123456', 10)
    expect(email.subject).toBe('Your TWS login code: 123456')
    expect(email.html.match(/123456/g)?.length).toBeGreaterThanOrEqual(3)
    expect(email.html).toContain('Expires in 10 minutes')
    expect(email.text).toContain('Your TWS client login code is 123456')
  })

  it('escapes the code in HTML', () => {
    expect(renderLoginCodeEmail('<b>', 10).html).not.toContain('<b>')
  })
})

describe('login codes', () => {
  it('generates six digits', () => {
    for (let i = 0; i < 50; i++) expect(generateLoginCode()).toMatch(/^\d{6}$/)
  })

  it('binds the hash to the email, case-insensitively', () => {
    expect(hashLoginCode('A@Example.com', '123456')).toBe(hashLoginCode('a@example.com', '123456'))
    expect(hashLoginCode('a@example.com', '123456')).not.toBe(hashLoginCode('b@example.com', '123456'))
  })
})

describe('SB Tracker client parsing', () => {
  it('normalises snake_case fields and matches contact emails', () => {
    const client = parseClient({
      id: 7,
      name: 'Acme',
      email: 'owner@acme.test',
      contact_emails: ['Billing@Acme.test'],
      status: 'past_due',
      renewsAt: '2026-11-01T00:00:00.000Z',
      estimatedMonthlyExpenses: 95,
      mrr: 12550,
    })
    expect(client).toMatchObject({
      id: '7',
      status: 'past_due',
      renewalDate: '2026-11-01',
      estimatedCostCad: 0.95,
      mrrCad: 125.5,
    })
    expect(clientMatchesEmail(client!, ' billing@acme.test ')).toBe(true)
    expect(clientMatchesEmail(client!, 'someone@acme.test')).toBe(false)
  })

  it('keeps only https portal links', () => {
    const base = { id: 1, email: 'a@b.test' }
    expect(parseClient({ ...base, portalUrl: 'https://sb-tracker.tranmer.ca/portal/abc' })?.portalUrl).toBe(
      'https://sb-tracker.tranmer.ca/portal/abc',
    )
    expect(parseClient({ ...base, portalUrl: 'javascript:alert(1)' })?.portalUrl).toBeNull()
    expect(parseClient({ ...base, portalUrl: 'undefined/portal/abc' })?.portalUrl).toBeNull()
    expect(parseClient(base)?.portalUrl).toBeNull()
  })

  it('rejects rows without an id or email', () => {
    expect(parseClient({ name: 'x' })).toBeNull()
    expect(parseClient(null)).toBeNull()
  })
})

describe('findClientsByEmail', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.SB_TRACKER_API_URL
    delete process.env.SB_TRACKER_API_KEY
  })

  it('scans unfiltered pages when the email filter is refused, skipping cancelled clients', async () => {
    process.env.SB_TRACKER_API_URL = 'https://sb.test'
    process.env.SB_TRACKER_API_KEY = 'key'
    const urls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: URL) => {
      urls.push(url.toString())
      if (url.searchParams.has('email')) return new Response('{}', { status: 400 })
      return Response.json({
        clients: [
          { id: 1, email: 'a@example.com', status: 'canceled' },
          { id: 2, email: 'other@example.com', status: 'active' },
          { id: 3, email: 'A@example.com', status: 'active' },
        ],
      })
    }))
    const matches = await findClientsByEmail('a@example.com')
    expect(matches.map((c) => c.id)).toEqual(['3'])
    expect(urls).toHaveLength(2)
  })

  it('throws when not configured', async () => {
    await expect(findClientsByEmail('a@example.com')).rejects.toThrow(/not configured/)
  })
})

describe('getClientExpenses', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.SB_TRACKER_API_URL
    delete process.env.SB_TRACKER_API_KEY
  })

  it('keeps unpriced items', async () => {
    process.env.SB_TRACKER_API_URL = 'https://sb.test'
    process.env.SB_TRACKER_API_KEY = 'key'
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      items: [
        { id: 'a', name: 'Vercel', offering_id: null, amount_cents: null },
        { id: 'b', name: 'Domain', offering_id: 'addon-domain', amount_cents: 3000, interval: 'year' },
      ],
    })))
    const items = (await getClientExpenses('7'))!
    expect(items.map((i) => [i.name, formatExpensePrice(i)])).toEqual([
      ['Vercel', 'Varies'],
      ['Domain', '$30/yr'],
    ])
  })
})

describe('getLatestInvoice', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.SB_TRACKER_API_URL
    delete process.env.SB_TRACKER_API_KEY
  })

  const stub = (res: Response) => {
    process.env.SB_TRACKER_API_URL = 'https://sb.test'
    process.env.SB_TRACKER_API_KEY = 'key'
    vi.stubGlobal('fetch', vi.fn(async () => res))
  }

  it('parses the share link, number and date', async () => {
    stub(Response.json({ invoice_number: 1042, url: 'https://my.freshbooks.com/#/link/abc', issued_at: '2026-10-01T00:00:00.000Z' }))
    expect(await getLatestInvoice('7')).toEqual({
      number: '1042', url: 'https://my.freshbooks.com/#/link/abc', issuedDate: '2026-10-01',
    })
  })

  it('returns null on 404 or a non-https link', async () => {
    stub(new Response(null, { status: 404 }))
    expect(await getLatestInvoice('7')).toBeNull()
    stub(Response.json({ invoice_number: '1', url: 'javascript:alert(1)' }))
    expect(await getLatestInvoice('7')).toBeNull()
  })
})

describe('planFromExpenses', () => {
  const expense = (offeringId: string | null, name = 'x'): SbExpense => ({
    id: name, name, offeringId, amountCents: 1000, interval: 'month', quantity: 1,
  })

  it('maps tiers, sprint and add-ons, keeping unknown items as other', () => {
    const plan = planFromExpenses([
      expense('infra-ecommerce'),
      expense('support-full'),
      expense('build-sprint'),
      expense('addon-domain'),
      expense(null, 'Legacy hosting'),
      expense('not-a-thing', 'Mystery'),
    ])
    expect(plan.selection).toEqual({ infra: 'infra-ecommerce', support: 'support-full' })
    expect(plan.sprint).toBe(true)
    expect(plan.addonIds).toEqual(['addon-domain'])
    expect(plan.other.map((e) => e.name)).toEqual(['Legacy hosting', 'Mystery'])
  })

  it('totals what the client is billed, skipping unpriced items', () => {
    const plan = planFromExpenses([
      { id: '1', name: 'Hosting', offeringId: 'infra-billboard', amountCents: 2500, interval: 'month', quantity: 1 },
      { id: '2', name: 'Mail', offeringId: 'addon-email-imap', amountCents: 1500, interval: 'month', quantity: 3 },
      { id: '3', name: 'Domain', offeringId: 'addon-domain', amountCents: 3000, interval: 'year', quantity: 1 },
      { id: '4', name: 'Vercel', offeringId: null, amountCents: null, interval: 'month', quantity: 1 },
    ])
    expect(plan.monthlyCad).toBe(40)
    expect(plan.annualCad).toBe(30)
    expect(plan.items).toHaveLength(4)
    expect(formatExpensePrice(plan.items[1])).toBe('3 × $5/mo')
  })
})

describe('planFromExpenses matching fallbacks', () => {
  const item = (id: string, name: string, offeringId: string | null, amountCents: number | null, quantity = 1, interval: 'month' | 'year' = 'month'): SbExpense => ({
    id, name, offeringId, amountCents, interval, quantity,
  })

  // Paris Tennis Club: hosting has no offering_id, so nothing set Level 1 and
  // the builder locked support and build.
  const paris = [
    item('1', 'App Database', 'addon-database', 1000),
    item('2', 'Domain', 'addon-domain', 3000, 1, 'year'),
    // SB Tracker sends the line total: 4 mailboxes at $5.
    item('3', 'Mailboxes', 'addon-email-imap', 2000, 4),
    item('4', 'Resend', 'addon-email-sending', 1000),
    item('5', 'Vercel Pro Hosting', null, null),
  ]

  it('infers app infrastructure from app add-ons and absorbs the hosting item', () => {
    const plan = planFromExpenses(paris)
    expect(plan.selection).toEqual({ infra: 'infra-app' })
    expect(plan.inferred).toEqual(['infra'])
    expect(plan.other).toEqual([])
    expect(plan.addonQty).toEqual({ 'addon-domain': 1, 'addon-email-imap': 4 })
  })

  it('shows Neon and Resend as included on App hosting and leaves them out of the total', () => {
    const plan = planFromExpenses(paris)
    const price = (name: string) => formatExpensePrice(plan.items.find((e) => e.name === name)!)
    expect(price('App Database')).toBe('Included')
    expect(price('Resend')).toBe('Included')
    expect(price('Mailboxes')).toBe('4 × $5/mo')
    expect(plan.monthlyCad).toBe(20)
    expect(plan.annualCad).toBe(30)
  })

  it('falls back to billboard for a lone hosting item, and leaves unknown plans alone', () => {
    expect(planFromExpenses([item('1', 'Vercel Pro Hosting', null, null)]).selection).toEqual({ infra: 'infra-billboard' })
    const plan = planFromExpenses([item('1', 'Consulting', null, 5000)])
    expect(plan.selection).toEqual({})
    expect(plan.inferred).toEqual([])
    expect(plan.other).toHaveLength(1)
  })

  it('never overrides an infra tier set by offering_id', () => {
    const plan = planFromExpenses([item('1', 'Hosting', 'infra-ecommerce', 5000), ...paris])
    expect(plan.selection.infra).toBe('infra-ecommerce')
    expect(plan.inferred).toEqual([])
    expect(plan.other.map((e) => e.name)).toEqual(['Vercel Pro Hosting'])
  })

  it('matches an exact offering name when offering_id is missing', () => {
    const plan = planFromExpenses([item('1', 'Domain', null, 3000, 1, 'year'), item('2', 'Email · Gmail', null, 1250, 2)])
    expect(plan.addonIds).toEqual(['addon-domain', 'addon-email-gmail'])
    expect(plan.addonQty).toEqual({ 'addon-domain': 1, 'addon-email-gmail': 2 })
  })
})

describe('parseChangeRequest', () => {
  it('accepts a valid request', () => {
    const result = parseChangeRequest(
      { selection: { infra: 'infra-app' }, addonIds: ['addon-domain'], notes: ' hi ', newEmail: 'new@example.com' },
      'old@example.com',
    )
    expect(result).toEqual({
      ok: true,
      request: {
        plan: { selection: { infra: 'infra-app' }, sprint: false, addonIds: ['addon-domain'] },
        notes: 'hi',
        newEmail: 'new@example.com',
        monthlyBilling: false,
      },
    })
  })

  it('keeps per-unit add-on quantities and rejects bad ones', () => {
    const ok = parseChangeRequest({ addonIds: ['addon-email-imap', 'addon-domain'], addonQty: { 'addon-email-imap': 4, 'addon-domain': 3 } }, 'a@b.ca')
    expect(ok.ok && ok.request.plan.addonQty).toEqual({ 'addon-email-imap': 4, 'addon-domain': 3 })
    expect(ok.ok && planTotals(ok.request.plan)).toMatchObject({ monthly: 20, annual: 90 })
    expect(parseChangeRequest({ addonIds: ['addon-email-imap'], addonQty: { 'addon-email-imap': 0 } }, 'a@b.ca').ok).toBe(false)
  })

  it('labels the sprint start date', () => {
    expect(sprintNotBeforeLabel()).toBe('Not before January 2027')
  })

  it('allows monthly billing only above the threshold', () => {
    const small = { addonIds: ['addon-email-imap'], addonQty: { 'addon-email-imap': 4 }, monthlyBilling: true }
    expect(parseChangeRequest(small, 'a@b.ca').ok).toBe(false)
    const big = parseChangeRequest({ ...small, selection: { support: 'support-minimal' } }, 'a@b.ca')
    expect(big.ok && big.request.monthlyBilling).toBe(true)
    const { text } = renderStaffEmail({ sessionEmail: 'a@b.ca', client: null, current: null, request: (big as { ok: true; request: ChangeRequest }).request })
    expect(text).toContain('Monthly billing requested')
  })

  it('rejects unknown tiers and add-ons', () => {
    expect(parseChangeRequest({ selection: { infra: 'infra-mars' } }, 'a@example.com').ok).toBe(false)
    expect(parseChangeRequest({ addonIds: ['addon-yacht'] }, 'a@example.com').ok).toBe(false)
  })

  it('rejects an empty request and a same-address email change', () => {
    expect(parseChangeRequest({}, 'a@example.com').ok).toBe(false)
    expect(parseChangeRequest({ newEmail: 'A@example.com' }, 'a@example.com').ok).toBe(false)
    expect(parseChangeRequest({ newEmail: 'bad<@x' }, 'a@example.com').ok).toBe(false)
  })
})

describe('renderStaffEmail', () => {
  it('escapes client input and includes the email change', () => {
    const { html, text } = renderStaffEmail({
      sessionEmail: 'a@example.com',
      client: null,
      current: null,
      request: {
        plan: { selection: {}, sprint: false, addonIds: [] },
        notes: '<script>alert(1)</script>',
        newEmail: 'new@example.com',
        monthlyBilling: false,
      },
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(text).toContain('To: new@example.com')
    expect(text).toContain('Plan items not available')
  })
})

describe('renderCancellationEmail', () => {
  it('names the client, escapes the reason and includes the current plan', () => {
    const { subject, html, text } = renderCancellationEmail({
      sessionEmail: 'a@example.com',
      client: {
        id: '7', name: 'Acme', email: 'a@example.com', contactEmails: [], status: 'active',
        mrrCad: 25, renewalDate: '2026-11-01', estimatedCostCad: 7.09, freshbooksClientId: 'fb1',
        portalUrl: null,
      },
      current: planFromExpenses([
        { id: '1', name: 'Hosting', offeringId: 'infra-billboard', amountCents: 2500, interval: 'month', quantity: 1 },
      ]),
      reason: 'Moving <b>on</b>',
    })
    expect(subject).toBe('Cancellation request: Acme')
    expect(html).not.toContain('<b>on</b>')
    expect(text).toContain('Reason: Moving <b>on</b>')
    expect(text).toContain('Infrastructure')
    expect(text).toContain('FreshBooks client ID: fb1')
    expect(text).toContain('click "Share Link with Client"')
  })
})
