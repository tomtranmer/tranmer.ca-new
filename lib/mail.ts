import nodemailer, { type Transporter } from 'nodemailer';
import { Resend } from 'resend';

/**
 * Outgoing email for the API routes.
 *
 * `sendEmail` sends through Resend's API when RESEND_API_KEY is set and falls
 * back to SMTP (nodemailer) if Resend isn't configured or the send fails for
 * a reason SMTP might not share (network, timeout, rate limit, 5xx, auth or
 * domain). A message Resend rejects as invalid (422) isn't retried over SMTP.
 * Set MAIL_PROVIDER=smtp to skip Resend entirely.
 */

export type EmailMessage = {
  to: string | string[];
  cc?: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  /** Short label for logs and Resend's dashboard: letters, numbers, `_` and `-`. */
  tag?: string;
  /** Stops Resend sending the same email twice if a request is retried. */
  idempotencyKey?: string;
};

export type SendResult = { provider: 'resend' | 'smtp'; id: string | null };

const DEFAULT_FROM = 'Tranmer Web Services <help@tranmer.ca>';
const RESEND_TIMEOUT_MS = 8_000;
const SMTP_TIMEOUT_MS = 10_000;

export class ResendSendError extends Error {
  constructor(
    message: string,
    readonly statusCode: number | null,
    readonly code: string,
  ) {
    super(message);
  }
}

/**
 * Shared SMTP transport, used as the fallback.
 *
 * Returns null when SMTP isn't configured so callers can answer 503 instead
 * of silently falling back to a default host.
 *
 * TLS is always required before credentials are sent: implicit TLS (port
 * 465) by default, or STARTTLS with `requireTLS` when SMTP_SECURE=false.
 * Without `requireTLS`, nodemailer only upgrades if the server offers
 * STARTTLS, so a downgrade could send the password in plaintext.
 */
export function createMailTransport(): Transporter | null {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const secure = SMTP_SECURE !== 'false';
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number.parseInt(SMTP_PORT || (secure ? '465' : '587'), 10),
    secure,
    requireTLS: !secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10_000,
    socketTimeout: 10_000,
  });
}

/** Reject if sending takes longer than `ms`, so a slow provider can't hang a request. */
export function withTimeout<T>(promise: Promise<T>, ms = 15_000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Email sending timeout')), ms)),
  ]);
}

function resendEnabled(): boolean {
  return !!process.env.RESEND_API_KEY && process.env.MAIL_PROVIDER !== 'smtp';
}

function smtpConfigured(): boolean {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return !!SMTP_HOST && !!SMTP_USER && !!SMTP_PASS;
}

/** True when at least one provider can send. */
export function isMailConfigured(): boolean {
  return resendEnabled() || smtpConfigured();
}

async function sendViaResend(message: EmailMessage): Promise<SendResult> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await withTimeout(
    resend.emails.send(
      {
        from: process.env.MAIL_FROM || DEFAULT_FROM,
        to: message.to,
        cc: message.cc,
        replyTo: message.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
        tags: message.tag ? [{ name: 'type', value: message.tag }] : undefined,
      },
      message.idempotencyKey ? { idempotencyKey: message.idempotencyKey } : undefined,
    ),
    RESEND_TIMEOUT_MS,
  );
  if (error) throw new ResendSendError(error.message, error.statusCode, error.name);
  return { provider: 'resend', id: data?.id ?? null };
}

async function sendViaSmtp(message: EmailMessage): Promise<SendResult> {
  const transporter = createMailTransport();
  if (!transporter) throw new Error('Email is not configured');
  const info = await withTimeout(
    transporter.sendMail({
      // The SMTP server only sends as its own mailbox.
      from: process.env.SMTP_USER,
      to: message.to,
      cc: message.cc,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
    SMTP_TIMEOUT_MS,
  );
  return { provider: 'smtp', id: info.messageId ?? null };
}

/** Send one email, through Resend first and SMTP as the fallback. Throws if neither sends it. */
export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const tag = message.tag ?? 'email';
  if (resendEnabled()) {
    try {
      const result = await sendViaResend(message);
      console.log('[MAIL] sent', { provider: result.provider, tag, id: result.id });
      return result;
    } catch (error) {
      const safeError = error instanceof Error ? error.message : 'Unknown error';
      // SMTP would reject an invalid message too.
      if (error instanceof ResendSendError && error.statusCode === 422) {
        console.error('[MAIL] Resend rejected the message:', { tag, code: error.code, error: safeError });
        throw error;
      }
      if (!smtpConfigured()) throw error;
      console.warn('[MAIL] Resend failed, falling back to SMTP:', { tag, error: safeError });
    }
  }
  const result = await sendViaSmtp(message);
  console.log('[MAIL] sent', { provider: result.provider, tag, id: result.id });
  return result;
}
