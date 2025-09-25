import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { satisfaction, features, appFeatures, appStory, bookingEase, email } = await request.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: true, // true for 465, false for other ports
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
      subject: `🎯 New Appstravaganza Survey Response - ${email || 'Anonymous'}`,
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
                  ${bookingEase >= 4 ? '😊 Great experience!' : bookingEase >= 3 ? '👍 Good' : '⚠️ Needs improvement'}
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

${satisfaction ? `SATISFACTION: ${satisfaction}` : ''}
${bookingEase ? `BOOKING EASE: ${bookingEase}/5` : ''}
${features && features.length > 0 ? `FEATURES: ${features.join(', ')}` : ''}
${appFeatures && appFeatures.length > 0 ? `APP FEATURES: ${appFeatures.join(', ')}` : ''}
${appStory ? `APP STORY: ${appStory}` : ''}
${email ? `CONTACT: ${email}` : ''}

---
Tranmer Web Services - Appstravaganza Survey System
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}