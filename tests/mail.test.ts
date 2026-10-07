import { afterEach, describe, expect, it } from 'vitest'
import { createMailTransport } from '../lib/mail'

const SMTP_KEYS = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_PORT', 'SMTP_SECURE'] as const
const saved = Object.fromEntries(SMTP_KEYS.map((k) => [k, process.env[k]]))

function setEnv(values: Partial<Record<(typeof SMTP_KEYS)[number], string>>) {
  for (const k of SMTP_KEYS) delete process.env[k]
  Object.assign(process.env, values)
}

// nodemailer keeps the resolved SMTP options on transporter.options.
const optionsOf = (t: ReturnType<typeof createMailTransport>) =>
  (t as unknown as { options: Record<string, unknown> }).options

afterEach(() => {
  for (const k of SMTP_KEYS) {
    if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  }
})

describe('createMailTransport', () => {
  it('returns null when SMTP is not configured', () => {
    setEnv({ SMTP_HOST: 'smtp.example.com', SMTP_USER: 'u' })
    expect(createMailTransport()).toBeNull()
  })

  it('defaults to implicit TLS on port 465', () => {
    setEnv({ SMTP_HOST: 'smtp.example.com', SMTP_USER: 'u', SMTP_PASS: 'p' })
    const opts = optionsOf(createMailTransport())
    expect(opts.secure).toBe(true)
    expect(opts.port).toBe(465)
  })

  it('requires STARTTLS when implicit TLS is disabled', () => {
    setEnv({ SMTP_HOST: 'smtp.example.com', SMTP_USER: 'u', SMTP_PASS: 'p', SMTP_SECURE: 'false' })
    const opts = optionsOf(createMailTransport())
    expect(opts.secure).toBe(false)
    expect(opts.requireTLS).toBe(true)
    expect(opts.port).toBe(587)
  })
})
