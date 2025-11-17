import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { lockInInterest, currentHostingPlan, yearsInterested, estimatedMonthlyCost, additionalServices, comments, email } = await request.json();

    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'help@tranmer.ca',
      subject: `🔒 New Hosting Pre-Booking Interest - ${email || 'Anonymous'}`,
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
            ${lockInInterest ? `
            <div class="priority">
              <div class="priority-label">Interest Level</div>
              <div class="field-value" style="margin-top: 8px; font-size: 18px; font-weight: 600;">
                ${lockInInterest}
              </div>
            </div>
            ` : ''}

            ${currentHostingPlan ? `
            <div class="field">
              <div class="field-label">Current Hosting Plan</div>
              <div class="field-value">${currentHostingPlan}</div>
            </div>
            ` : ''}

            ${yearsInterested ? `
            <div class="field">
              <div class="field-label">Lock-In Period Requested</div>
              <div class="field-value">
                <span class="badge">${yearsInterested}</span>
              </div>
            </div>
            ` : ''}

            ${estimatedMonthlyCost ? `
            <div class="field">
              <div class="field-label">Estimated Current Monthly Cost</div>
              <div class="field-value">${estimatedMonthlyCost}</div>
            </div>
            ` : ''}

            ${additionalServices && additionalServices.length > 0 ? `
            <div class="field">
              <div class="field-label">Additional Services Interested In</div>
              <div class="field-value">
                <div class="tags">
                  ${additionalServices.map((service: string) => `<span class="tag">${service}</span>`).join('')}
                </div>
              </div>
            </div>
            ` : ''}

            ${comments ? `
            <div class="field">
              <div class="field-label">📝 Comments/Questions</div>
              <div class="field-value" style="margin-top: 15px; font-style: italic; line-height: 1.7;">
                "${comments}"
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

INTEREST LEVEL: ${lockInInterest}
CURRENT PLAN: ${currentHostingPlan}
LOCK-IN PERIOD: ${yearsInterested}
${estimatedMonthlyCost ? `ESTIMATED MONTHLY COST: ${estimatedMonthlyCost}` : ''}
${additionalServices && additionalServices.length > 0 ? `ADDITIONAL SERVICES: ${additionalServices.join(', ')}` : ''}
${comments ? `COMMENTS: ${comments}` : ''}
CONTACT: ${email}

---
Tranmer Web Services - Hosting Pre-Booking System
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
