import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { resetRateLimits } from '../lib/security'
import { renderLoginNoticeEmail, renderStaffLoginNotice } from '../lib/loginNoticeEmail'

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  initializeDatabase: vi.fn(),
  sendEmail: vi.fn(),
  findClientsByEmail: vi.fn(),
  notices: [] as string[],
}))

vi.mock('botid/server', () => ({ checkBotId: async () => ({ isBot: false }) }))
vi.mock('../lib/mail', () => ({ isMailConfigured: () => true, sendEmail: mocks.sendEmail }))
vi.mock('../lib/db', () => ({ query: mocks.query, initializeDatabase: mocks.initializeDatabase }))
vi.mock('../lib/sbTracker', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/sbTracker')>()),
  isSbTrackerConfigured: () => true,
  findClientsByEmail: mocks.findClientsByEmail,
}))

beforeAll(() => {
  process.env.CLIENT_SESSION_SECRET = 'test-secret-that-is-at-least-32-characters-long'
})

beforeEach(() => {
  resetRateLimits()
  mocks.notices = []
  mocks.initializeDatabase.mockResolvedValue(undefined)
  mocks.sendEmail.mockResolvedValue({ provider: 'resend', id: 'x' })
  // A tiny fake of the two tables the route touches.
  mocks.query.mockImplementation(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('COUNT(*)') && sql.includes('client_login_codes')) return { rows: [{ count: '0' }] }
    if (sql.includes('FROM client_login_notices')) {
      return { rows: mocks.notices.includes(params[0] as string) ? [{ '?column?': 1 }] : [] }
    }
    if (sql.includes('INSERT INTO client_login_notices')) {
      mocks.notices.push(params[0] as string)
      return { rows: [] }
    }
    return { rows: [] }
  })
})

afterEach(() => vi.clearAllMocks())

const requestCode = async (email: string) => {
  const { POST } = await import('../app/api/client/login/request/route')
  return POST(
    new NextRequest('https://tranmer.ca/api/client/login/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://tranmer.ca', host: 'tranmer.ca' },
      body: JSON.stringify({ email }),
    })
  )
}

const client = (id: string, name: string) => ({ id, name, email: 'x@example.com', contactEmails: [], status: 'active' })

describe('login notices', () => {
  it('sends the "no account" email and a staff notice for an unknown address, with the usual response', async () => {
    mocks.findClientsByEmail.mockResolvedValue([])
    const res = await requestCode('Stranger@Example.com')
    expect(await res.json()).toEqual({ ok: true, message: 'If that email is on file, a code is on its way.' })

    const [visitor, staff] = mocks.sendEmail.mock.calls.map((c) => c[0])
    expect(visitor).toMatchObject({ to: 'stranger@example.com', subject: 'Signing in to your TWS client portal', tag: 'login-notice' })
    expect(visitor.text).toContain('isn’t linked to a TWS client account yet')
    expect(staff).toMatchObject({ to: 'help@tranmer.ca', replyTo: 'stranger@example.com', tag: 'login-notice-staff' })
    expect(staff.subject).toBe('Portal login from an unknown address: stranger@example.com')
  })

  it('sends at most one notice per address per day', async () => {
    mocks.findClientsByEmail.mockResolvedValue([])
    await requestCode('a@example.com')
    await requestCode('a@example.com')
    expect(mocks.sendEmail).toHaveBeenCalledTimes(2) // visitor + staff, once
  })

  it('explains a shared address and lists the matching clients for staff', async () => {
    mocks.findClientsByEmail.mockResolvedValue([client('79', 'Hewson Acoustics'), client('92', 'Hewson Building Supply')])
    await requestCode('shared@example.com')
    const [visitor, staff] = mocks.sendEmail.mock.calls.map((c) => c[0])
    expect(visitor.text).toContain('more than one TWS client account')
    expect(staff.text).toContain('Hewson Acoustics (SB Tracker #79)')
    expect(staff.text).toContain('Hewson Building Supply (SB Tracker #92)')
  })

  it('still sends a code (and no notice) for a matched client', async () => {
    mocks.findClientsByEmail.mockResolvedValue([client('20', 'Tom Tranmer')])
    await requestCode('tom@tranmer.ca')
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1)
    expect(mocks.sendEmail.mock.calls[0][0].tag).toBe('login-code')
  })

  it('answers the same way if the notice fails to send', async () => {
    mocks.findClientsByEmail.mockResolvedValue([])
    mocks.sendEmail.mockRejectedValue(new Error('mail down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await requestCode('b@example.com')
    expect(res.status).toBe(200)
  })
})

describe('login notice emails', () => {
  it('never include anything but fixed wording', () => {
    for (const kind of ['no_account', 'multiple_accounts'] as const) {
      const email = renderLoginNoticeEmail(kind)
      expect(email.html).not.toMatch(/@example|stranger/)
      expect(email.text).toContain('help@tranmer.ca')
    }
  })

  it('escapes the address in the staff email', () => {
    const staff = renderStaffLoginNotice({ email: '<b>x@example.com', kind: 'no_account', matchedClients: [] })
    expect(staff.html).not.toContain('<b>x@')
  })
})
