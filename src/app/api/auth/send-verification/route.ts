import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createVerificationToken } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    const token = await createVerificationToken(user.id);
    
    // Send verification email
    await sendVerificationEmail(user.email, user.name, token).catch((err) => {
      console.error('Failed to send verification email:', err);
      throw new Error('Failed to send verification email');
    });

    return NextResponse.json({
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}