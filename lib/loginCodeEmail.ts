import { escapeHtml } from '@/lib/security';

/**
 * The client portal login code email. Table layout and inline styles only, so
 * it renders the same in Gmail, Outlook and Apple Mail.
 */
export function renderLoginCodeEmail(code: string, ttlMinutes: number): { subject: string; html: string; text: string } {
  const safeCode = escapeHtml(code);
  const subject = `Your TWS login code: ${code}`;

  const text = `Your TWS client login code is ${code}

It expires in ${ttlMinutes} minutes. If you didn't ask for this, you can ignore this email.

Questions? Reply to this email or write to help@tranmer.ca.
Tranmer Web Services · https://tranmer.ca/web`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b">
<div style="display:none;max-height:0;overflow:hidden">Your code is ${safeCode}. It expires in ${ttlMinutes} minutes.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0">
        <tr>
          <td style="padding:28px 32px 0;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#2563eb">
            Tranmer Web Services
          </td>
        </tr>
        <tr>
          <td style="padding:12px 32px 0">
            <h1 style="margin:0;font-size:22px;line-height:1.3;color:#0f172a">Your login code</h1>
            <p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:#475569">Enter this code to log in to your TWS client account.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px">
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px;text-align:center;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#1e3a8a">${safeCode}</div>
            <p style="margin:12px 0 0;font-size:13px;color:#64748b;text-align:center">Expires in ${ttlMinutes} minutes</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px;font-size:13px;line-height:1.5;color:#64748b;border-top:1px solid #f1f5f9">
            <p style="margin:20px 0 0">If you didn't ask for this code, you can ignore this email. Your account is safe.</p>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#94a3b8">
        Questions? Reply or write to <a href="mailto:help@tranmer.ca" style="color:#64748b">help@tranmer.ca</a><br>
        <a href="https://tranmer.ca/web" style="color:#64748b">tranmer.ca</a>
      </p>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
