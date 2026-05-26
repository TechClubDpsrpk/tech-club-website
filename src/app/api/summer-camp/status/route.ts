import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSummerCampRegistration } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, registered: false }, { status: 200 });
    }

    const registration = await getSummerCampRegistration(user.id);
    return NextResponse.json({
      authenticated: true,
      registered: !!registration,
      registration
    });
  } catch (error) {
    console.error('Check summer camp status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
