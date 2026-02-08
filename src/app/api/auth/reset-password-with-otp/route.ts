import { NextResponse } from 'next/server';
import { verifyPasswordResetToken, updateUserPassword } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const { email, otp, newPassword } = await request.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { error: 'Email, OTP, and new password are required' },
                { status: 400 }
            );
        }

        // Rate limiting
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const { allowed } = await checkRateLimit(ip, 'reset-password');

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Verify token (uses admin client internally in db.ts now)
        const userId = await verifyPasswordResetToken(email, otp, true);

        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid or expired reset code' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await updateUserPassword(userId, hashedPassword);

        // Delete the used token
        // Format OTP to UUID for deletion (matching usage in db.ts)
        const tokenUuid = `00000000-0000-0000-0000-000000${otp}`;

        if (supabaseAdmin) {
            const { error } = await supabaseAdmin
                .from('verification_tokens')
                .delete()
                .eq('token', tokenUuid)
                .eq('user_id', userId);

            if (error) {
                console.error("Failed to delete used token", error);
            }
        } else {
            console.error("Internal Error: supabaseAdmin missing, cannot delete token");
        }

        return NextResponse.json(
            { message: 'Password has been reset successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
