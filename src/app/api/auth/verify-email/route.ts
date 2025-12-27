import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken, markEmailAsVerified, getUserById } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/account?error=invalid-token', request.url));
    }

    const userId = await verifyEmailToken(token);

    if (!userId) {
      return NextResponse.redirect(new URL('/account?error=token-expired', request.url));
    }

    await markEmailAsVerified(userId);

    return NextResponse.redirect(new URL('/account?verified=true', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/account?error=verification-failed', request.url));
  }
}
