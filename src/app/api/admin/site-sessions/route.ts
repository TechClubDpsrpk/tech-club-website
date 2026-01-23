import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { verifyAdminSession } from '@/lib/supabase-admin';
import { supabaseAdmin } from '@/lib/supabase-admin';

import { canManageSiteAccess } from '@/lib/roles';

// Protect this route with Double Lock
async function checkAdmin(req: NextRequest) {
    const { authenticated, user } = await verifyAuth(req);

    // Check if user is authenticated and has permission
    if (!authenticated || !user || !canManageSiteAccess(user.roles)) return null;

    const vaultCookie = req.cookies.get('admin_vault')?.value;
    if (!vaultCookie) return null;

    const isVaultValid = await verifyAdminSession(vaultCookie);
    if (!isVaultValid) return null;

    return user;
}

export async function GET(req: NextRequest) {
    const admin = await checkAdmin(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { data, error } = await supabaseAdmin!
            .from('site_access_sessions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ sessions: data });
    } catch (error) {
        console.error('Error fetching site sessions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const admin = await checkAdmin(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        const { error } = await supabaseAdmin!
            .from('site_access_sessions')
            .delete()
            .eq('id', sessionId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error revoking site session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
