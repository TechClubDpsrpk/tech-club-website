import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createVerificationToken } from '@/lib/db';

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
    
    // TODO: Send email with token
    // For now, just return the token
    console.log('Verification token:', token);

    return NextResponse.json({
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}