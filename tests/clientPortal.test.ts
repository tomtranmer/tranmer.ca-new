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
  parseClient,
  planFromExpenses,
  type SbExpense,
} from '../lib/sbTracker'
import { parseChangeRequest, renderStaffEmail } from '../lib/changeRequest'

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
      monthlyExpensesCad: 95,
      mrrCad: 125.5,
    })
    expect(clientMatchesEmail(client!, ' billing@acme.test ')).toBe(true)
    expect(clientMatchesEmail(client!, 'someone@acme.test')).toBe(false)
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
      },
    })
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
      },
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(text).toContain('To: new@example.com')
    expect(text).toContain('Plan items not available')
  })
})
