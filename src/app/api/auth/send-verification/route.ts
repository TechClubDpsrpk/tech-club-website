import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById, createVerificationToken } from '@/lib/db';

// Simple email sending (replace with real service like SendGrid, Resend, etc)
async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

  console.log(`
Verification email would be sent to: ${email}
Click this link to verify: ${verificationUrl}
  `);

  // In production, use a real email service:
  // await sendgrid.send({
  //   to: email,
  //   from: "noreply@yourapp.com",
  //   subject: "Verify your email",
  //   html: `Click here to verify: <a href="${verificationUrl}">Verify Email</a>`
  // });
}

export async function POST(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    const token = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
