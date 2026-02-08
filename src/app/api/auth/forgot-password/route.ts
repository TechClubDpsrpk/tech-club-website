import { NextResponse } from 'next/server';
import { findUserByEmail, createPasswordResetToken } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Rate limiting
        // Using a simplified IP check here as in login route
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const { allowed } = await checkRateLimit(ip, 'forgot-password');

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const user = await findUserByEmail(email);

        // Always return success even if user not found to prevent enumeration
        if (!user) {
            // Simulate delay to match success case
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json(
                { message: 'If an account exists with this email, a reset code has been sent.' },
                { status: 200 }
            );
        }

        const otp = await createPasswordResetToken(user.id);
        await sendPasswordResetEmail(email, user.name, otp);

        return NextResponse.json(
            { message: 'If an account exists with this email, a reset code has been sent.' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
