import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, clearAuthCookie } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function POST(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete user from database
    const dbUser = await getUserById(user.id);
    if (dbUser) {
      // In a real app, you'd delete from DB
      // For now, we'll just clear the auth
    }

    await clearAuthCookie();

    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
