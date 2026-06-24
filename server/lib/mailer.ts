import { requireEnv } from './config.js';

type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendMail(mail: Mail) {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'CarMerica <security@carmerica.com>',
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });
    if (!response.ok) throw new Error(`Resend email failed: ${response.status}`);
    return;
  }

  if (process.env.SENDGRID_API_KEY) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: mail.to }] }],
        from: { email: process.env.MAIL_FROM_EMAIL || 'security@carmerica.com', name: 'CarMerica' },
        subject: mail.subject,
        content: [
          { type: 'text/plain', value: mail.text },
          { type: 'text/html', value: mail.html },
        ],
      }),
    });
    if (!response.ok) throw new Error(`SendGrid email failed: ${response.status}`);
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    requireEnv('RESEND_API_KEY');
  }

  console.warn('[MAIL] No email provider configured. Email suppressed in non-production.', {
    to: mail.to,
    subject: mail.subject,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

  await sendMail({
    to,
    subject: 'Reset your CarMerica password',
    text: `Reset your password using this secure link: ${resetUrl}`,
    html: `<p>Reset your CarMerica password using this secure link:</p><p><a href="${resetUrl}">Reset password</a></p>`,
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  await sendMail({
    to,
    subject: 'Verify your CarMerica account',
    text: `Please verify your email address by clicking this link: ${verifyUrl}`,
    html: `<p>Please verify your email address by clicking this link:</p><p><a href="${verifyUrl}">Verify Email</a></p>`,
  });
}

export async function sendOtpEmail(to: string, otp: string, purpose: 'registration' | 'login') {
  const subject = purpose === 'registration' 
    ? 'Verify your CarMerica Registration' 
    : 'Your CarMerica Login OTP Code';
    
  const text = `Your OTP code for ${purpose} is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #003580;">CarMerica Security Alert</h2>
      <p>Hello,</p>
      <p>We received a request for <strong>${purpose}</strong> on your CarMerica account.</p>
      <p style="font-size: 16px; margin: 10px 0;">Your One-Time Password (OTP) is:</p>
      <div style="font-size: 28px; font-weight: bold; color: #003580; letter-spacing: 2px; padding: 15px 0; text-align: center; background-color: #f4f6f9; border-radius: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="font-size: 12px; color: #666;">This code is valid for 10 minutes. If you did not request this, please secure your account immediately.</p>
    </div>
  `;

  await sendMail({ to, subject, text, html });
}


