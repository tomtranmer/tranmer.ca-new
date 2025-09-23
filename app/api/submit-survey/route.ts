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

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'help@tranmer.ca',
      subject: 'User Survey Response',
      text: `
Satisfaction: ${satisfaction}
Booking Ease (1-5): ${bookingEase}
Features: ${features.join(', ')}
App Features: ${appFeatures.join(', ')}
App Story: ${appStory}
Email: ${email}
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}