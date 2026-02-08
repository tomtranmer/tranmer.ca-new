import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { query, initializeDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Initialize database on first request
    await initializeDatabase();

    const { referredEmail, referrerEmail } = await request.json();

    // Validate referredEmail
    if (!referredEmail || typeof referredEmail !== 'string') {
      return NextResponse.json(
        { message: 'Referred email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(referredEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format for referred email' },
        { status: 400 }
      );
    }

    // Validate referrer email if provided
    if (referrerEmail && !emailRegex.test(referrerEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format for referrer email' },
        { status: 400 }
      );
    }

    // Check referral limit (5 per customer)
    let referralStatus = 'pending';
    let limitNote = '';
    
    if (referrerEmail) {
      const referralCount = await query(
        'SELECT COUNT(*) as count FROM referrals WHERE referrer_email = $1',
        [referrerEmail]
      );

      const count = parseInt(referralCount.rows[0].count, 10);
      if (count >= 5) {
        referralStatus = 'OVER_LIMIT';
        limitNote = `Over referral limit (${count + 1} total). Customer has exceeded 5 referral maximum.`;
      }
    }
    const existingReferral = await query(
      'SELECT id FROM referrals WHERE referrer_email = $1 AND referred_email = $2',
      [referrerEmail || null, referredEmail]
    );

    if (existingReferral.rows.length > 0) {
      return NextResponse.json(
        { message: 'You have already referred this email address' },
        { status: 409 }
      );
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // Create introduction email
    const introducedByText = referrerEmail
      ? `${referrerEmail} thinks you should talk to TWS about hosting migration.`
      : 'Someone thinks you should talk to TWS about hosting migration.';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>TWS Hosting Migration Referral</title>
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
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 20px;
            border-radius: 12px 12px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            background: white;
            padding: 40px 30px;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .intro {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 20px;
            padding: 20px;
            background-color: #f0f9ff;
            border-left: 4px solid #2563eb;
            border-radius: 4px;
          }
          .benefits {
            margin: 30px 0;
          }
          .benefits h3 {
            color: #1e293b;
            font-size: 18px;
            margin-bottom: 15px;
          }
          .benefit-item {
            padding: 12px 0;
            padding-left: 20px;
            color: #475569;
            position: relative;
          }
          .benefit-item:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #16a34a;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            font-size: 16px;
          }
          .cta-button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to TWS Hosting!</h1>
        </div>
        <div class="content">
          <div class="intro">
            <strong>Great news!</strong> ${introducedByText}
          </div>

          <p>We specialize in seamless hosting migrations with:</p>
          
          <div class="benefits">
            <div class="benefit-item">Zero-downtime migrations</div>
            <div class="benefit-item">Expert migration support</div>
            <div class="benefit-item">Competitive pricing</div>
            <div class="benefit-item">24/7 customer support</div>
          </div>

          <p>If you're interested in learning more about hosting migration or would like to discuss your current setup, we'd love to hear from you.</p>

          <center>
            <a href="https://tranmer.ca/referral" class="cta-button">Learn More About Our Services</a>
          </center>

          <p>You can also reply directly to this email to ask any questions or start a conversation with our team.</p>

          <div class="footer">
            <p>Best regards,<br>
            <strong>TWS Hosting Team</strong><br>
            <a href="mailto:help@tranmer.ca" style="color: #2563eb; text-decoration: none;">help@tranmer.ca</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to referee with referrer CC'd
    const ccList = referrerEmail ? referrerEmail : undefined;
    
    try {
      // Send email with 15 second timeout
      await Promise.race([
        transporter.sendMail({
          from: process.env.SMTP_USER || 'help@tranmer.ca',
          to: referredEmail,
          cc: ccList,
          subject: `${referrerEmail ? referrerEmail + ' suggests' : 'Someone suggests'} TWS for Your Hosting Migration`,
          html: emailHtml,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email sending timeout')), 15000)
        ),
      ]);
    } catch (emailError) {
      // Log email error but continue - referral is still tracked
      // Only log safe error message, not the full error object which may contain sensitive data
      const safeError = emailError instanceof Error ? emailError.message : 'Unknown error';
      console.error('Email sending failed:', safeError);
      // Still proceed with storing the referral
    }

    // Store referral in database
    const emailSentAt = new Date();
    const result = await query(
      `INSERT INTO referrals (referrer_email, referred_email, email_sent_at, status, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [referrerEmail || null, referredEmail, emailSentAt, referralStatus, limitNote || null]
    );

    const referralId = result.rows[0].id;

    // Log referral
    console.log(`[REFERRAL] New referral tracked:`, {
      id: referralId,
      referrerEmail: referrerEmail || 'anonymous',
      referredEmail,
      status: referralStatus,
      timestamp: emailSentAt.toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: referralStatus === 'OVER_LIMIT' 
          ? `Referral saved for ${referredEmail}. Note: You have exceeded the 5 referral promotional limit, but we're still tracking this.`
          : `Introduction email sent to ${referredEmail}`,
        referralId,
        status: referralStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    // Only log safe error message, not the full error object which may contain sensitive data
    const safeError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error submitting referral:', safeError);

    const errorMessage = safeError;

    return NextResponse.json(
      { message: `Failed to send referral: ${errorMessage}` },
      { status: 500 }
    );
  }
}
