import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  try {
    const { password } = await req.json();

    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create token for anyone who enters correct password
    const token = await createToken({ id: 'admin', email: 'admin@localhost' });

    const response = NextResponse.json({ success: true });
    response.cookies.set('auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}