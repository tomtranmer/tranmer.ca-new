import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  checkRateLimit,
  escapeHtml,
  forbiddenOriginResponse,
  getClientIp,
  isSameOrigin,
  isValidEmail,
  maskEmail,
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
    const limit = checkRateLimit(`prebooking:${ip}`, RATE_LIMIT);
    if (!limit.allowed) {
      console.warn('Rate limit exceeded for a hosting pre-booking submission');
      return rateLimitResponse(limit.retryAfterSeconds);
    }

    // Parse and validate request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const {
      lockInInterest,
      currentHostingPlan,
      yearsInterested,
      estimatedMonthlyCost,
      additionalServices,
      comments,
      email
    } = body;

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (typeof comments === 'string' && comments.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Comments too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Plain values are validated and length capped, for the text/plain part
    // and for logging. The sanitized values below are HTML escaped for the
    // HTML part of the email.
    const plain = {
      email: email.trim(),
      lockInInterest: sanitizeText(lockInInterest, 200),
      currentHostingPlan: sanitizeText(currentHostingPlan, 200),
      yearsInterested: sanitizeText(yearsInterested, 100),
      estimatedMonthlyCost: sanitizeText(estimatedMonthlyCost, 100),
      comments: sanitizeText(comments, 1000),
      additionalServices: sanitizeStringList(additionalServices, {
        maxItems: 10,
        maxLength: 100,
      }),
    };

    const sanitizedEmail = escapeHtml(plain.email);
    const sanitizedLockInInterest = escapeHtml(plain.lockInInterest);
    const sanitizedCurrentHostingPlan = escapeHtml(plain.currentHostingPlan);
    const sanitizedYearsInterested = escapeHtml(plain.yearsInterested);
    const sanitizedEstimatedMonthlyCost = escapeHtml(plain.estimatedMonthlyCost);
    const sanitizedComments = escapeHtml(plain.comments);
    const sanitizedAdditionalServices = plain.additionalServices.map(escapeHtml);

    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Check SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP configuration missing');
      return NextResponse.json(
        { error: 'Email service temporarily unavailable' },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE !== 'false', // Secure unless explicitly disabled
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (error) {
      // Only log safe error message, not the full error object which may contain sensitive data
      const safeError = error instanceof Error ? error.message : 'Unknown error';
      console.error('SMTP verification failed:', safeError);
      return NextResponse.json(
        { error: 'Email service configuration error' },
        { status: 503 }
      );
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'help@tranmer.ca',
      subject: `🔒 New Hosting Pre-Booking Interest - ${plain.email || 'Anonymous'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Hosting Pre-Booking Response</title>
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
            .badge {
              display: inline-block;
              background: #48bb78;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 14px;
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
            .priority {
              background: #fef3c7;
              border: 1px solid #fbbf24;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .priority-label {
              font-weight: 600;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔒 New Hosting Pre-Booking Interest</h1>
            <p>2026 Rate Lock-In Registration</p>
            <p style="font-size: 14px; opacity: 0.8;">Received on ${currentDate}</p>
          </div>
          
          <div class="content">
            ${sanitizedLockInInterest ? `
            <div class="priority">
              <div class="priority-label">Interest Level</div>
              <div class="field-value" style="margin-top: 8px; font-size: 18px; font-weight: 600;">
                ${sanitizedLockInInterest}
              </div>
            </div>
            ` : ''}

            ${sanitizedCurrentHostingPlan ? `
            <div class="field">
              <div class="field-label">Current Hosting Plan</div>
              <div class="field-value">${sanitizedCurrentHostingPlan}</div>
            </div>
            ` : ''}

            ${sanitizedYearsInterested ? `
            <div class="field">
              <div class="field-label">Lock-In Period Requested</div>
              <div class="field-value">
                <span class="badge">${sanitizedYearsInterested}</span>
              </div>
            </div>
            ` : ''}

            ${sanitizedEstimatedMonthlyCost ? `
            <div class="field">
              <div class="field-label">Estimated Current Monthly Cost</div>
              <div class="field-value">${sanitizedEstimatedMonthlyCost}</div>
            </div>
            ` : ''}

            ${sanitizedAdditionalServices && sanitizedAdditionalServices.length > 0 ? `
            <div class="field">
              <div class="field-label">Additional Services Interested In</div>
              <div class="field-value">
                <div class="tags">
                  ${sanitizedAdditionalServices.map((service: string) => `<span class="tag">${service}</span>`).join('')}
                </div>
              </div>
            </div>
            ` : ''}

            ${sanitizedComments ? `
            <div class="field">
              <div class="field-label">📝 Comments/Questions</div>
              <div class="field-value" style="margin-top: 15px; font-style: italic; line-height: 1.7;">
                "${sanitizedComments}"
              </div>
            </div>
            ` : ''}

            ${sanitizedEmail ? `
            <div class="contact-info">
              <div class="contact-label">📧 Contact Email</div>
              <div class="contact-value">${sanitizedEmail}</div>
            </div>
            ` : ''}
            
            <div class="footer">
              <p><strong>Tranmer Web Services</strong> • Hosting Pre-Booking System</p>
              <p>This response was submitted through the hosting pre-booking form at tranmer.ca</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
🔒 NEW HOSTING PRE-BOOKING INTEREST
Received: ${currentDate}

INTEREST LEVEL: ${plain.lockInInterest}
CURRENT PLAN: ${plain.currentHostingPlan}
LOCK-IN PERIOD: ${plain.yearsInterested}
${plain.estimatedMonthlyCost ? `ESTIMATED MONTHLY COST: ${plain.estimatedMonthlyCost}` : ''}
${plain.additionalServices.length > 0 ? `ADDITIONAL SERVICES: ${plain.additionalServices.join(', ')}` : ''}
${plain.comments ? `COMMENTS: ${plain.comments}` : ''}
CONTACT: ${plain.email}

---
Tranmer Web Services - Hosting Pre-Booking System
      `.trim(),
    };

    // Send email with timeout
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 30000); // 30 second timeout
    });

    await Promise.race([emailPromise, timeoutPromise]);

    // Log successful submission (without sensitive data)
    console.log(`Hosting pre-booking form submitted. Email: ${maskEmail(plain.email)}`);

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    // Only log safe error message, not the full error object which may contain sensitive data
    const safeError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing hosting pre-booking submission:', safeError);

    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 408 }
        );
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json(
          { error: 'Email service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      if (error.message.includes('Authentication failed')) {
        return NextResponse.json(
          { error: 'Email service configuration error' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
