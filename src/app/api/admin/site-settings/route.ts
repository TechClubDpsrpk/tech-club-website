import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { verifyAdminSession, getSiteSetting, updateSiteSetting } from '@/lib/supabase-admin';
import { canManageSiteAccess } from '@/lib/roles';

// Protect this route with Double Lock
async function checkAdmin(req: NextRequest) {
    const { authenticated, user } = await verifyAuth(req);

    // Check if user is authenticated and has permission (President, VP, Developer)
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
        const maintenanceMode = await getSiteSetting('maintenance_mode');
        return NextResponse.json({ maintenance_mode: maintenanceMode || { enabled: false } });
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const admin = await checkAdmin(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { key, value } = await req.json();

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Missing key or value' }, { status: 400 });
        }

        // Restrict which keys can be updated for safety
        const allowedKeys = ['maintenance_mode'];
        if (!allowedKeys.includes(key)) {
            return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 });
        }

        await updateSiteSetting(key, value);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating site settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
