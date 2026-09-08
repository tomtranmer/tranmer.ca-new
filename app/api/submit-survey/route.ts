import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  checkRateLimit,
  escapeHtml,
  forbiddenOriginResponse,
  getClientIp,
  isSameOrigin,
  isValidEmail,
  rateLimitResponse,
  sanitizeStringList,
  sanitizeText,
} from '@/lib/security';

const RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
      return forbiddenOriginResponse();
    }

    const ip = getClientIp(request);
    const limit = checkRateLimit(`survey:${ip}`, RATE_LIMIT);
    if (!limit.allowed) {
      return rateLimitResponse(limit.retryAfterSeconds);
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const emailInput = typeof body.email === 'string' ? body.email.trim() : '';
    if (emailInput && !isValidEmail(emailInput)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Plain values are validated and length capped, for the text/plain part
    // and for logging. The escaped values below are what the HTML part uses.
    const plain = {
      satisfaction: sanitizeText(body.satisfaction, 200),
      appStory: sanitizeText(body.appStory, 2000),
      bookingEase: sanitizeText(body.bookingEase, 10),
      email: emailInput,
      websiteGoal: sanitizeText(body.websiteGoal, 100),
      websiteGoalOther: sanitizeText(body.websiteGoalOther, 500),
      features: sanitizeStringList(body.features, { maxItems: 25, maxLength: 200 }),
      appFeatures: sanitizeStringList(body.appFeatures, { maxItems: 25, maxLength: 200 }),
    };

    const satisfaction = escapeHtml(plain.satisfaction);
    const appStory = escapeHtml(plain.appStory);
    const bookingEase = escapeHtml(plain.bookingEase);
    const bookingEaseScore = Number.parseInt(plain.bookingEase, 10) || 0;
    const email = escapeHtml(plain.email);
    const websiteGoal = escapeHtml(plain.websiteGoal);
    const websiteGoalOther = escapeHtml(plain.websiteGoalOther);
    const features = plain.features.map(escapeHtml);
    const appFeatures = plain.appFeatures.map(escapeHtml);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP configuration missing');
      return NextResponse.json(
        { error: 'Email service temporarily unavailable' },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'help@tranmer.ca',
      subject: `🎯 New Appstravaganza Survey Response - ${plain.email || 'Anonymous'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Survey Response</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              border-radius: 12px 12px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 12px 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .field {
              margin-bottom: 25px;
              padding: 20px;
              background-color: #f8fafc;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .field-label {
              font-weight: 600;
              color: #4a5568;
              margin-bottom: 8px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .field-value {
              color: #2d3748;
              font-size: 16px;
              line-height: 1.5;
            }
            .rating {
              display: inline-block;
              background: #48bb78;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: 600;
            }
            .story-section {
              background: #edf2f7;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .tags {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 8px;
            }
            .tag {
              background: #667eea;
              color: white;
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 14px;
              font-weight: 500;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              color: #718096;
              font-size: 14px;
            }
            .contact-info {
              background: #e6fffa;
              border: 1px solid #81e6d9;
              border-radius: 8px;
              padding: 15px;
              margin-top: 20px;
            }
            .contact-label {
              font-weight: 600;
              color: #2c7a7b;
            }
            .contact-value {
              color: #285e61;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 New Survey Response</h1>
            <p>Appstravaganza Onboarding Survey</p>
            <p style="font-size: 14px; opacity: 0.8;">Received on ${currentDate}</p>
          </div>
          
          <div class="content">
            ${websiteGoal ? `
            <div class="field">
              <div class="field-label">Website Goal</div>
              <div class="field-value">
                ${{ billboard: 'A Billboard display to announce services and provide information to visitors.', interactive: 'An interactive space that allows visitors to accomplish something or learn something about your business.', 'business-tool': 'A critical business tool that keeps track of key information and processes related to my business.', community: 'A tool for showing off our values and for building community around an initiative that brings value to the world.', other: `Other: ${websiteGoalOther}` }[websiteGoal as string] || websiteGoal}
              </div>
            </div>
            ` : ''}

            ${satisfaction ? `
            <div class="field">
              <div class="field-label">Overall Satisfaction</div>
              <div class="field-value">${satisfaction}</div>
            </div>
            ` : ''}

            ${bookingEase ? `
            <div class="field">
              <div class="field-label">Booking Ease Rating</div>
              <div class="field-value">
                <span class="rating">${bookingEase}/5</span>
                <span style="margin-left: 10px; color: #718096;">
                  ${bookingEaseScore >= 4 ? '😊 Great experience!' : bookingEaseScore >= 3 ? '👍 Good' : '⚠️ Needs improvement'}
                </span>
              </div>
            </div>
            ` : ''}

            ${features && features.length > 0 ? `
            <div class="field">
              <div class="field-label">Requested Features</div>
              <div class="field-value">
                <div class="tags">
                  ${features.map((feature: string) => `<span class="tag">${feature}</span>`).join('')}
                </div>
              </div>
            </div>
            ` : ''}

            ${appFeatures && appFeatures.length > 0 ? `
            <div class="field">
              <div class="field-label">Required App Features</div>
              <div class="field-value">
                <div class="tags">
                  ${appFeatures.map((feature: string) => `<span class="tag">${feature}</span>`).join('')}
                </div>
              </div>
            </div>
            ` : ''}

            ${appStory ? `
            <div class="story-section">
              <div class="field-label">📖 App Story</div>
              <div class="field-value" style="margin-top: 15px; font-style: italic; line-height: 1.7;">
                "${appStory}"
              </div>
            </div>
            ` : ''}

            ${email ? `
            <div class="contact-info">
              <div class="contact-label">📧 Contact Email</div>
              <div class="contact-value">${email}</div>
            </div>
            ` : ''}
            
            <div class="footer">
              <p><strong>Tranmer Web Services</strong> • Appstravaganza Survey System</p>
              <p>This response was submitted through the onboarding survey at tranmer.ca</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🎯 NEW APPSTRAVAGANZA SURVEY RESPONSE
Received: ${currentDate}

${plain.websiteGoal ? `WEBSITE GOAL: ${{ billboard: 'Billboard display', interactive: 'Interactive space', 'business-tool': 'Critical business tool', community: 'Values/community tool', other: `Other: ${plain.websiteGoalOther}` }[plain.websiteGoal] || plain.websiteGoal}` : ''}
${plain.satisfaction ? `SATISFACTION: ${plain.satisfaction}` : ''}
${plain.bookingEase ? `BOOKING EASE: ${plain.bookingEase}/5` : ''}
${plain.features.length > 0 ? `FEATURES: ${plain.features.join(', ')}` : ''}
${plain.appFeatures.length > 0 ? `APP FEATURES: ${plain.appFeatures.join(', ')}` : ''}
${plain.appStory ? `APP STORY: ${plain.appStory}` : ''}
${plain.email ? `CONTACT: ${plain.email}` : ''}

---
Tranmer Web Services - Appstravaganza Survey System
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    // Only log safe error message, not the full error object which may contain sensitive data
    const safeError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending email:', safeError);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}