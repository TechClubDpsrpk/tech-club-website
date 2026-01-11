// app/api/site-login/route.ts (Create this new file)

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createSiteSession } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  // Use the same admin password hash
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  try {
    const { password } = await req.json();

    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        {
          success: false,
          error: 'Site access not configured'
        },
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Incorrect password'
      });
    }

    // Create DB Session
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // We try to get geo info if available (or pass unknown)
    const session = await createSiteSession(ip, userAgent);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Access granted'
    });

    // Set the site access cookie with SESSION ID (not JWT)
    response.cookies.set('site_access', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
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
