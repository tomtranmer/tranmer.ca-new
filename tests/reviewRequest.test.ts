import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
  REVIEW_EMAIL_COOKIE,
  emailFromLink,
  parseReviewRequest,
  renderReviewConfirmation,
  renderReviewStaffEmail,
  type ReviewRequest,
} from '../lib/reviewRequest'
import type { SbClient } from '../lib/sbTracker'
import { resetRateLimits } from '../lib/security'

const mocks = vi.hoisted(() => ({
  sendEmail: vi.fn(),
  query: vi.fn(),
  initializeDatabase: vi.fn(),
  findClientsByEmail: vi.fn(),
  loadClientContext: vi.fn(),
}))

vi.mock('botid/server', () => ({ checkBotId: async () => ({ isBot: false }) }))
vi.mock('../lib/mail', () => ({ isMailConfigured: () => true, sendEmail: mocks.sendEmail }))
vi.mock('../lib/db', () => ({ query: mocks.query, initializeDatabase: mocks.initializeDatabase }))
vi.mock('../lib/sbTracker', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/sbTracker')>()),
  isSbTrackerConfigured: () => true,
  findClientsByEmail: mocks.findClientsByEmail,
  loadClientContext: mocks.loadClientContext,
}))

const client: SbClient = {
  id: '7',
  name: 'Galeforce Welding',
  email: 'owner@example.com',
  contactEmails: [],
  status: 'active',
} as unknown as SbClient

const baseRequest: ReviewRequest = {
  email: 'owner@example.com',
  name: 'Pat',
  website: 'example.com',
  topics: ['hosting', 'backups'],
  notes: 'Thinking about moving email to Google.',
  source: 'newsletter-2026-11',
}

describe('emailFromLink', () => {
  it('accepts a valid address and lower-cases it', () => {
    expect(emailFromLink(' Owner@Example.com ')).toBe('owner@example.com')
    expect(emailFromLink(['a@example.com', 'b@example.com'])).toBe('a@example.com')
  })

  it('rejects junk, empty values and unfilled Mailchimp tags', () => {
    expect(emailFromLink(undefined)).toBeNull()
    expect(emailFromLink('')).toBeNull()
    expect(emailFromLink('*|EMAIL|*')).toBeNull()
    expect(emailFromLink('<script>@x.com')).toBeNull()
  })
})

describe('parseReviewRequest', () => {
  it('needs a valid email', () => {
    expect(parseReviewRequest({ email: 'nope' })).toEqual({ ok: false, error: 'Please enter a valid email address' })
    expect(parseReviewRequest(null)).toEqual({ ok: false, error: 'Invalid request' })
  })

  it('accepts just an email', () => {
    const parsed = parseReviewRequest({ email: 'A@Example.com' })
    expect(parsed).toEqual({
      ok: true,
      request: { email: 'a@example.com', name: '', website: '', topics: [], notes: '', source: '' },
    })
  })

  it('rejects unknown topics and de-duplicates known ones', () => {
    expect(parseReviewRequest({ email: 'a@example.com', topics: ['hosting', 'crypto'] })).toEqual({
      ok: false,
      error: 'Unknown topic',
    })
    const parsed = parseReviewRequest({ email: 'a@example.com', topics: ['email', 'email'] })
    expect(parsed.ok && parsed.request.topics).toEqual(['email'])
  })

  it('caps lengths and strips odd characters from the source', () => {
    const parsed = parseReviewRequest({
      email: 'a@example.com',
      name: 'x'.repeat(500),
      notes: 'y'.repeat(5000),
      source: 'news<letter>-2026',
    })
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.request.name).toHaveLength(100)
    expect(parsed.request.notes).toHaveLength(2000)
    expect(parsed.request.source).toBe('newsletter-2026')
  })
})

describe('review emails', () => {
  it('includes SB Tracker details for a known client', () => {
    const email = renderReviewStaffEmail({ request: baseRequest, matches: [client], client, current: null })
    expect(email.subject).toBe('2027 review request: Galeforce Welding')
    expect(email.text).toContain('Requested by: owner@example.com')
    expect(email.text).toContain('Topics: Hosting plan, Backups')
    expect(email.text).toContain('Source: newsletter-2026-11')
  })

  it('flags an address that is not on file', () => {
    const email = renderReviewStaffEmail({ request: baseRequest, matches: [], client: null, current: null })
    expect(email.text).toContain('Not found in SB Tracker')
  })

  it('escapes what the visitor typed', () => {
    const email = renderReviewStaffEmail({
      request: { ...baseRequest, notes: '<img src=x onerror=alert(1)>' },
      matches: [],
      client: null,
      current: null,
    })
    expect(email.html).not.toContain('<img')
    expect(email.html).toContain('&lt;img')
  })

  it('never repeats visitor text in the client confirmation', () => {
    const confirmation = renderReviewConfirmation()
    expect(confirmation.html).not.toContain(baseRequest.notes)
    expect(confirmation.subject).toBe('We received your 2027 review request')
  })
})

describe('GET /review', () => {
  it('moves the address into a cookie and redirects to a clean URL', async () => {
    const { GET } = await import('../app/review/route')
    const res = await GET(new NextRequest('https://tranmer.ca/review?email=Owner%40Example.com&src=newsletter-2026-11'))
    expect(res.status).toBe(303)
    const location = res.headers.get('location')!
    expect(location).toBe('https://tranmer.ca/web/review?src=newsletter-2026-11')
    expect(location).not.toContain('example.com')
    expect(res.cookies.get(REVIEW_EMAIL_COOKIE)?.value).toBe('owner@example.com')
  })

  it('redirects without a cookie when the address is missing or invalid', async () => {
    const { GET } = await import('../app/review/route')
    const res = await GET(new NextRequest('https://tranmer.ca/review?email=*|EMAIL|*'))
    expect(res.headers.get('location')).toBe('https://tranmer.ca/web/review')
    expect(res.cookies.get(REVIEW_EMAIL_COOKIE)).toBeUndefined()
  })
})

describe('POST /api/review-request', () => {
  const post = async (body: object) => {
    const { POST } = await import('../app/api/review-request/route')
    return POST(
      new NextRequest('https://tranmer.ca/api/review-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: 'https://tranmer.ca', host: 'tranmer.ca' },
        body: JSON.stringify(body),
      })
    )
  }

  beforeEach(() => {
    resetRateLimits()
    mocks.sendEmail.mockResolvedValue({ provider: 'resend', id: 'x' })
    mocks.initializeDatabase.mockResolvedValue(undefined)
    mocks.query.mockResolvedValue({ rows: [{ id: 12 }] })
    mocks.loadClientContext.mockResolvedValue({ client, current: null })
  })

  afterEach(() => vi.clearAllMocks())

  it('emails help@ with claude@ copied, then confirms to a known client', async () => {
    mocks.findClientsByEmail.mockResolvedValue([client])
    const res = await post({ email: 'owner@example.com', topics: ['hosting'] })
    expect(res.status).toBe(200)

    expect(mocks.sendEmail).toHaveBeenCalledTimes(2)
    const [staff, confirmation] = mocks.sendEmail.mock.calls.map((c) => c[0])
    expect(staff).toMatchObject({
      to: 'help@tranmer.ca',
      cc: 'claude@tranmer.ca',
      replyTo: 'owner@example.com',
      subject: '2027 review request: Galeforce Welding (#12)',
    })
    expect(confirmation).toMatchObject({ to: 'owner@example.com', subject: 'We received your 2027 review request' })
  })

  it('does not send a confirmation to an address that is not on file', async () => {
    mocks.findClientsByEmail.mockResolvedValue([])
    const res = await post({ email: 'stranger@example.com', notes: 'buy now' })
    expect(res.status).toBe(200)
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1)
    expect(mocks.sendEmail.mock.calls[0][0].to).toBe('help@tranmer.ca')
  })

  it('still emails staff when SB Tracker and the database are down', async () => {
    mocks.findClientsByEmail.mockRejectedValue(new Error('SB Tracker down'))
    mocks.initializeDatabase.mockRejectedValue(new Error('DB down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await post({ email: 'owner@example.com' })
    expect(res.status).toBe(200)
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1)
    expect(mocks.sendEmail.mock.calls[0][0].subject).toBe('2027 review request: owner@example.com')
  })

  it('rejects an invalid email and rate limits repeat requests for one address', async () => {
    expect((await post({ email: 'nope' })).status).toBe(400)
    mocks.findClientsByEmail.mockResolvedValue([])
    for (let i = 0; i < 3; i++) expect((await post({ email: 'a@example.com' })).status).toBe(200)
    expect((await post({ email: 'a@example.com' })).status).toBe(429)
  })
})
