/**
 * Emails sent when someone asks for a login code but the address doesn't
 * match exactly one client in SB Tracker.
 *
 * The visitor's email is fixed wording only: the form can't prove who typed
 * the address, so nothing they control is ever repeated back. It's a
 * transactional notice, not marketing: no tracking, no list sign-up.
 *
 * The staff email tells help@ which address tried, so it can be added to the
 * right client's contacts in SB Tracker.
 */
import { escapeHtml } from '@/lib/security';

export type LoginNoticeKind = 'no_account' | 'multiple_accounts';

type Email = { subject: string; html: string; text: string };

function layout(title: string, preheader: string, paragraphs: string[], button?: { href: string; label: string }): string {
  const body = paragraphs
    .map((p) => `<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#334155">${escapeHtml(p)}</p>`)
    .join('\n');
  const cta = button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 0"><tr><td style="border-radius:999px;background:#2563eb">
<a href="${escapeHtml(button.href)}" style="display:inline-block;padding:10px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${escapeHtml(button.label)}</a>
</td></tr></table>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0">
        <tr>
          <td style="padding:28px 32px 0;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#2563eb">Tranmer Web Services</td>
        </tr>
        <tr>
          <td style="padding:12px 32px 28px">
            <h1 style="margin:0;font-size:22px;line-height:1.3;color:#0f172a">${escapeHtml(title)}</h1>
${body}
${cta}
            <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#64748b">If you didn't try to sign in, you can ignore this email. Nothing has changed on any account.</p>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#94a3b8">Tranmer Web Services · <a href="mailto:help@tranmer.ca" style="color:#94a3b8">help@tranmer.ca</a> · <a href="https://tranmer.ca/web" style="color:#94a3b8">tranmer.ca/web</a></p>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function textVersion(title: string, paragraphs: string[], button?: { href: string; label: string }): string {
  return [
    title,
    '',
    ...paragraphs.flatMap((p) => [p, '']),
    ...(button ? [`${button.label}: ${button.href}`, ''] : []),
    "If you didn't try to sign in, you can ignore this email. Nothing has changed on any account.",
    '',
    'Tranmer Web Services · help@tranmer.ca · https://tranmer.ca/web',
  ].join('\n');
}

/** To the address that asked for a code. Fixed wording; nothing the visitor typed is included. */
export function renderLoginNoticeEmail(kind: LoginNoticeKind): Email {
  if (kind === 'multiple_accounts') {
    const title = 'Let’s get you signed in';
    const paragraphs = [
      'Someone asked to sign in to the TWS client portal with this email address.',
      'This address is linked to more than one TWS client account, so we can’t tell which one to open. Reply to this email or write to help@tranmer.ca with the business you’d like to sign in for, and we’ll sort it out promptly.',
    ];
    return {
      subject: 'Signing in to your TWS client portal',
      html: layout(title, 'This email is linked to more than one account.', paragraphs),
      text: textVersion(title, paragraphs),
    };
  }

  const title = 'We couldn’t find your account';
  const paragraphs = [
    'Someone asked to sign in to the TWS client portal with this email address, but it isn’t linked to a TWS client account yet.',
    'Already a TWS client? Reply to this email or write to help@tranmer.ca with your business name, and we’ll add this address to your account so you can sign in.',
    'Not a client yet? You can see our 2027 plans, or ask for a free review of your current hosting, domains, email and backups.',
  ];
  const button = { href: 'https://tranmer.ca/web', label: 'See 2027 plans' };
  return {
    subject: 'Signing in to your TWS client portal',
    html: layout(title, 'This address isn’t linked to a TWS client account yet.', paragraphs, button),
    text: textVersion(title, paragraphs, button),
  };
}

/** To help@, so the address can be added to the right client in SB Tracker. */
export function renderStaffLoginNotice({
  email,
  kind,
  matchedClients,
}: {
  email: string;
  kind: LoginNoticeKind;
  matchedClients: { id: string; name: string }[];
}): Email {
  const lines =
    kind === 'no_account'
      ? [
          `${email} asked for a client portal login code, but it doesn't match any client in SB Tracker.`,
          'They were sent the "we couldn’t find your account" email. If this is a client contact, add the address to their contact emails in SB Tracker, then ask them to try again.',
        ]
      : [
          `${email} asked for a client portal login code, but it matches ${matchedClients.length} clients in SB Tracker:`,
          ...matchedClients.map((c) => `• ${c.name} (SB Tracker #${c.id})`),
          'They were asked to reply with the business they want. Remove the address from all but one client, or give them a separate address.',
        ];
  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5;color:#1e293b">
<h2>Client portal login: ${kind === 'no_account' ? 'address not on file' : 'address on several clients'}</h2>
${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('\n')}
<p style="color:#64748b;font-size:13px">Sent from the tranmer.ca client portal. At most one notice per address per day.</p>
</body></html>`;
  return {
    subject: `Portal login ${kind === 'no_account' ? 'from an unknown address' : 'from a shared address'}: ${email}`,
    html,
    text: lines.join('\n'),
  };
}
