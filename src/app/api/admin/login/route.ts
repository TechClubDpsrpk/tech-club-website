import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { verifyAuth } from '@/lib/auth';
import { createAdminSession } from '@/lib/supabase-admin';
import { isIPBanned, checkRateLimit, logLoginAttempt, evaluateBan } from '@/lib/rate-limit';

import { hasAccessToAdminPanel } from '@/lib/roles';

export async function POST(req: NextRequest) {
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const { password } = await req.json();

    if (await isIPBanned(ip)) {
      return NextResponse.json(
        { success: false, error: 'Access denied. This IP address has been banned.' },
        { status: 403 }
      );
    }

    const { allowed } = await checkRateLimit(ip, 'admin');
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

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

    if (!hasAccessToAdminPanel(user.roles)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied. You do not have valid staff permissions.'
        },
        { status: 403 }
      );
    }

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


    await logLoginAttempt(ip, 'admin', password, isValid, userAgent);

    if (!isValid) {

      await evaluateBan(ip);

      return NextResponse.json({
        success: false,
        error: 'Incorrect admin password'
      });
    }


    const session = await createAdminSession(user.id, ip, userAgent);


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
