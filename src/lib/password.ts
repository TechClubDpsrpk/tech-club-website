import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/db';
// import { hashPassword } from "@/lib/password";
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, confirmPassword } = body;

    // Validation
    if (!email || !name || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await createUser(email, name, hashedPassword);

    // Create token and set cookie
    const token = await createToken(user);
    await setAuthCookie(token);

    const response = NextResponse.json(
      { message: 'Account created successfully', user: { id: user.id, email, name } },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
