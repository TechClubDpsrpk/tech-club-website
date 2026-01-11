import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { verifyAuth } from '@/lib/auth';
import { createAdminSession } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  try {
    const { password } = await req.json();

    // 1. LOCK 1: Verify Supabase Identity
    const { authenticated, user } = await verifyAuth(req);

    if (!authenticated || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not logged in. Please log in with your Supabase account first.'
        },
        { status: 401 }
      );
    }

    if (!user.is_admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied. You do not have admin privileges.'
        },
        { status: 403 }
      );
    }

    // 2. LOCK 2: Verify Master Password
    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server misconfiguration - hash not found'
        },
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Incorrect admin password'
      });
    }

    // 3. Create Session in Supabase
    // Get client info
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const session = await createAdminSession(user.id, ip, userAgent);

    // 4. Set Cookie and Return
    const response = NextResponse.json({
      success: true,
      message: 'Admin vault unlocked'
    });

    response.cookies.set('admin_vault', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return response;

  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown')
      },
      { status: 500 }
    );
  }
}