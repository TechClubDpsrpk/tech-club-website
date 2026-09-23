import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      );
    }

    const fullUser = await getUserById(sessionUser.id);

    return NextResponse.json({
      isAuthenticated: true,
      user: fullUser || sessionUser,
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 500 }
    );
  }
}
