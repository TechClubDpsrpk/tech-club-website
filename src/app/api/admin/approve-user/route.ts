import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { canManageRoles } from '@/lib/roles';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email';
import { createVerificationToken } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { authenticated, user: currentUser } = await verifyAuth(req);

        if (!authenticated || !currentUser) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if current user has permission to manage roles (same check as roles)
        if (!canManageRoles(currentUser.roles)) {
            return NextResponse.json(
                { success: false, error: 'Access Denied: You do not have permission to approve users.' },
                { status: 403 }
            );
        }

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Invalid request body' },
                { status: 400 }
            );
        }

        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Missing Service Key');
        }

        // Get user details for emails
        const { data: user, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError || !user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Update the user's approval status
        const { error } = await supabaseAdmin
            .from('users')
            .update({
                is_approved: true
            })
            .eq('id', userId);

        if (error) {
            console.error('Error approving user:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to approve user' },
                { status: 500 }
            );
        }

        // Send Welcome Email
        try {
            await sendWelcomeEmail(user.email, user.name);
            console.log(`✅ Welcome email sent to: ${user.email}`);
        } catch (err) {
            console.error(`❌ Failed to send welcome email to ${user.email}:`, err);
        }

        // Create Verification Token and Send Verification Email
        if (!user.email_verified) {
            try {
                const verificationToken = await createVerificationToken(user.id);
                console.log(`✅ Verification token created for: ${user.email}`);
                await sendVerificationEmail(user.email, user.name, verificationToken);
                console.log(`✅ Verification email sent to: ${user.email}`);
            } catch (err) {
                console.error(`❌ Verification token/email error for ${user.email}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'User approved successfully'
        });

    } catch (error) {
        console.error('Approve user error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
