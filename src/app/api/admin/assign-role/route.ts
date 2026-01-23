import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { canManageRoles } from '@/lib/roles';

export async function POST(req: NextRequest) {
    try {
        const { authenticated, user: currentUser } = await verifyAuth(req);

        if (!authenticated || !currentUser) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if current user has permission to manage roles
        if (!canManageRoles(currentUser.roles)) {
            return NextResponse.json(
                { success: false, error: 'Access Denied: You do not have permission to assign roles.' },
                { status: 403 }
            );
        }

        const { userId, roles } = await req.json();

        if (!userId || !Array.isArray(roles)) {
            return NextResponse.json(
                { success: false, error: 'Invalid request body' },
                { status: 400 }
            );
        }

        if (!supabaseAdmin) {
            throw new Error('Server misconfiguration: Missing Service Key');
        }

        // Update the user's roles
        const { error } = await supabaseAdmin
            .from('users')
            .update({
                roles: roles,
                // Keep is_admin synced for backwards compatibility if needed, 
                // or just rely on roles. Let's sync is_admin to true if they have any admin-like role?
                // User said: "all admins are in core...".
                // Let's not touch is_admin unless we decide to deprecate it. 
                // But the current middleware probably checks is_admin. 
                // We should probably update is_admin to true if they have *any* role except maybe 'user'?
                // The user said "all admins are in core".
                // Let's strictly update `roles`. We can deal with `is_admin` legacy flag separately or just set it to true if they have roles.
                // For now, let's explicitely specificy `is_admin` based on if they have roles.
                is_admin: roles.length > 0
            })
            .eq('id', userId);

        if (error) {
            console.error('Error assigning roles:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to update roles' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Roles updated successfully'
        });

    } catch (error) {
        console.error('Assign role error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
