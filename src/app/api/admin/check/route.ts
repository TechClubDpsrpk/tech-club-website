import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { verifyAdminSession } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
    try {
        // 1. Check Supabase Auth (Lock 1)
        const { authenticated, user } = await verifyAuth(req);

        if (!authenticated || !user) {
            return NextResponse.json({
                authenticated: false,
                vaultUnlocked: false,
                reason: 'Not logged in'
            });
        }

        if (!user.is_admin) {
            return NextResponse.json({
                authenticated: true,
                vaultUnlocked: false, // Technically authenticated, but not admin
                isAdmin: false,
                reason: 'Not an admin'
            });
        }

        // 2. Check Vault Session (Lock 2)
        const vaultCookie = req.cookies.get('admin_vault')?.value;

        if (!vaultCookie) {
            return NextResponse.json({
                authenticated: true,
                isAdmin: true,
                vaultUnlocked: false,
                reason: 'No vault session'
            });
        }

        const isVaultValid = await verifyAdminSession(vaultCookie);

        if (!isVaultValid) {
            // Clear invalid cookie
            const response = NextResponse.json({
                authenticated: true,
                isAdmin: true,
                vaultUnlocked: false,
                reason: 'Session expired'
            });
            response.cookies.delete('admin_vault');
            return response;
        }

        return NextResponse.json({
            authenticated: true,
            isAdmin: true,
            vaultUnlocked: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}
