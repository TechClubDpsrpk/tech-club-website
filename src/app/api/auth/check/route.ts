import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    return NextResponse.json({ isAuthenticated: true, user }, { status: 200 });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}
