import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'TC Web <onboarding@resend.dev>',
    to: email,
    subject: 'Welcome to TC Web 🚀',
    html: `
      <h2>Hey ${name} 👋</h2>
      <p>Welcome aboard! Your account is ready.</p>
      <p>Welcome to the Tech Club of DPS Ruby Park.</p>
    `,
  });
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

  await resend.emails.send({
    from: 'TC Web <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <h2>Verify your email 📧</h2>
      <p>Hi ${name},</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #C9A227;
        color: #000;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
        margin: 20px 0;
      ">
        Verify Email
      </a>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This link will expire in 24 hours.
      </p>
    `,
  });
}