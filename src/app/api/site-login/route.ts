import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createSiteSession } from '@/lib/supabase-admin';
import { isIPBanned, checkRateLimit, logLoginAttempt, evaluateBan } from '@/lib/rate-limit';

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

    const { allowed, remaining } = await checkRateLimit(ip, 'site');
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        { success: false, error: 'Site access not configured' },
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    await logLoginAttempt(ip, 'site', password, isValid, userAgent);

    if (!isValid) {
      await evaluateBan(ip);

      return NextResponse.json({
        success: false,
        error: 'Incorrect password'
      });
    }

    const session = await createSiteSession(ip, userAgent);

    const response = NextResponse.json({
      success: true,
      message: 'Access granted'
    });

    response.cookies.set('site_access', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;

  } catch (err) {
    console.error("Site login error: ", err);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown')
      },
      { status: 500 }
    );
  }
}
