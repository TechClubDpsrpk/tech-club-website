import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  try {
    const { password } = await req.json();

    // Build debug info to return in response
    const debugInfo = {
      hashExists: !!ADMIN_PASSWORD_HASH,
      hashLength: ADMIN_PASSWORD_HASH?.length || 0,
      hashStartsWith: ADMIN_PASSWORD_HASH?.substring(0, 7) || 'MISSING',
      passwordLength: password?.length || 0,
      environment: process.env.NODE_ENV,
    };

    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server misconfiguration - hash not found',
          debug: debugInfo 
        },
        { status: 500 }
      );
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    return NextResponse.json({ 
      success: isValid,
      error: isValid ? undefined : 'Incorrect password',
      debug: debugInfo // You'll see this in browser console
    });
  } catch (err) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown'),
        debug: { error: String(err) }
      },
      { status: 500 }
    );
  }
}