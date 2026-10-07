import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Shared SMTP transport for the API routes.
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
