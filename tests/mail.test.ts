import { afterEach, describe, expect, it, vi } from 'vitest'
import nodemailer from 'nodemailer'
import { createMailTransport, isMailConfigured, ResendSendError, sendEmail } from '../lib/mail'

const resendSend = vi.hoisted(() => vi.fn())
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: resendSend }
  },
}))

const SMTP_KEYS = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_PORT', 'SMTP_SECURE', 'RESEND_API_KEY', 'MAIL_PROVIDER', 'MAIL_FROM'] as const
const saved = Object.fromEntries(SMTP_KEYS.map((k) => [k, process.env[k]]))

function setEnv(values: Partial<Record<(typeof SMTP_KEYS)[number], string>>) {
  for (const k of SMTP_KEYS) delete process.env[k]
  Object.assign(process.env, values)
}

// nodemailer keeps the resolved SMTP options on transporter.options.
const optionsOf = (t: ReturnType<typeof createMailTransport>) =>
  (t as unknown as { options: Record<string, unknown> }).options

afterEach(() => {
  vi.restoreAllMocks()
  resendSend.mockReset()
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

describe('sendEmail', () => {
  const smtp = { SMTP_HOST: 'smtp.example.com', SMTP_USER: 'box@tranmer.ca', SMTP_PASS: 'p' }
  const message = { to: 'a@b.ca', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi', tag: 'test' }

  function mockSmtp() {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'smtp-1' })
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail } as never)
    return sendMail
  }

  it('sends through Resend when configured, without touching SMTP', async () => {
    setEnv({ ...smtp, RESEND_API_KEY: 're_test', MAIL_FROM: 'TWS <help@tranmer.ca>' })
    const sendMail = mockSmtp()
    resendSend.mockResolvedValue({ data: { id: 're-1' }, error: null })

    await expect(sendEmail({ ...message, idempotencyKey: 'k1' })).resolves.toEqual({ provider: 'resend', id: 're-1' })
    expect(resendSend).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'TWS <help@tranmer.ca>', to: 'a@b.ca', tags: [{ name: 'type', value: 'test' }] }),
      { idempotencyKey: 'k1' },
    )
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('falls back to SMTP, sending as the SMTP mailbox, when Resend fails', async () => {
    setEnv({ ...smtp, RESEND_API_KEY: 're_test' })
    const sendMail = mockSmtp()
    resendSend.mockResolvedValue({ data: null, error: { message: 'down', statusCode: 500, name: 'internal_server_error' } })

    await expect(sendEmail(message)).resolves.toEqual({ provider: 'smtp', id: 'smtp-1' })
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'box@tranmer.ca', to: 'a@b.ca' }))
  })

  it('falls back to SMTP when the Resend call throws', async () => {
    setEnv({ ...smtp, RESEND_API_KEY: 're_test' })
    const sendMail = mockSmtp()
    resendSend.mockRejectedValue(new Error('fetch failed'))

    await expect(sendEmail(message)).resolves.toMatchObject({ provider: 'smtp' })
    expect(sendMail).toHaveBeenCalledOnce()
  })

  it('does not retry an invalid message over SMTP', async () => {
    setEnv({ ...smtp, RESEND_API_KEY: 're_test' })
    const sendMail = mockSmtp()
    resendSend.mockResolvedValue({ data: null, error: { message: 'bad to', statusCode: 422, name: 'validation_error' } })

    await expect(sendEmail(message)).rejects.toBeInstanceOf(ResendSendError)
    expect(sendMail).not.toHaveBeenCalled()
  })

  it('throws the Resend error when there is no SMTP to fall back to', async () => {
    setEnv({ RESEND_API_KEY: 're_test' })
    resendSend.mockResolvedValue({ data: null, error: { message: 'down', statusCode: 503, name: 'application_error' } })
    await expect(sendEmail(message)).rejects.toThrow('down')
  })

  it('uses SMTP only without a Resend key or with MAIL_PROVIDER=smtp', async () => {
    for (const env of [smtp, { ...smtp, RESEND_API_KEY: 're_test', MAIL_PROVIDER: 'smtp' }]) {
      setEnv(env)
      mockSmtp()
      await expect(sendEmail(message)).resolves.toMatchObject({ provider: 'smtp' })
      vi.restoreAllMocks()
    }
    expect(resendSend).not.toHaveBeenCalled()
  })

  it('reports whether any provider is configured', () => {
    setEnv({})
    expect(isMailConfigured()).toBe(false)
    setEnv({ RESEND_API_KEY: 're_test' })
    expect(isMailConfigured()).toBe(true)
    setEnv({ RESEND_API_KEY: 're_test', MAIL_PROVIDER: 'smtp' })
    expect(isMailConfigured()).toBe(false)
    setEnv(smtp)
    expect(isMailConfigured()).toBe(true)
  })
})
