import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        roles: user.roles || [],
      },
    });
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 401 }
    );
  }
}