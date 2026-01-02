// app/api/site-login/route.ts (Create this new file)

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

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

    // Create JWT token for site access
    const token = await new SignJWT({ 
      siteAccess: true,
      iat: Math.floor(Date.now() / 1000)
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d') // Token expires in 30 days
      .sign(JWT_SECRET);

    // Create response
    const response = NextResponse.json({ 
      success: true,
      message: 'Access granted'
    });

    // Set the site access cookie
    response.cookies.set('site_access', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
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