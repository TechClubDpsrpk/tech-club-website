import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  // Safe debug: dev-only, no secrets
  if (process.env.NODE_ENV === 'development') {
    console.log(
      'Admin hash loaded:',
      Boolean(ADMIN_PASSWORD_HASH),
      'length:',
      ADMIN_PASSWORD_HASH?.length
    );
  }

  try {
    const { password } = await req.json();

    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration' },
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    return NextResponse.json({ success: isValid });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
