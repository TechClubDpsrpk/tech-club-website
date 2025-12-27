import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'TC Web <onboarding@resend.dev>', // works in dev
    to: email,
    subject: 'Welcome to TC Web 🚀',
    html: `
      <h2>Hey ${name} 👋</h2>
      <p>Welcome aboard! Your account is ready.</p>
      <p>Welcome to the Tech Club of DPS Ruby Park.</p>
    `,
  });
}
