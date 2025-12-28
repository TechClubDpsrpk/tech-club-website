import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, createVerificationToken } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createToken } from '@/lib/auth';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      password,
      confirmPassword,
      phoneNumber,
      class: userClass,
      section,
      githubId,
      interestedNiches,
    } = body;

    // Check all required fields
    if (
      !email ||
      !name ||
      !password ||
      !confirmPassword ||
      !phoneNumber ||
      !userClass ||
      !section
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!Array.isArray(interestedNiches) || interestedNiches.length === 0) {
      return NextResponse.json(
        { error: 'Select at least one niche' },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      email: email.toLowerCase(),
      name,
      passwordHash: hashedPassword,
      phoneNumber,
      class: userClass,
      section,
      githubId: githubId || null,
      interestedNiches,
    });

    // 🔥 SEND WELCOME EMAIL (non-blocking optional)
    await sendWelcomeEmail(user.email, user.name).catch(console.error);

    // 🔥 CREATE VERIFICATION TOKEN AND SEND VERIFICATION EMAIL (non-blocking optional)
    const verificationToken = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, user.name, verificationToken).catch(
      (err) => {
        console.error('Failed to send verification email:', err);
      }
    );

    const token = await createToken(user);

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phone_number,
          class: user.class,
          section: user.section,
          githubId: user.github_id,
          interestedNiches: user.interested_niches,
          emailVerified: user.email_verified,
        },
      },
      { status: 201 }
    );

    response.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}