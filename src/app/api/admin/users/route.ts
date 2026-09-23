import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { verifyAdminSession, supabaseAdmin } from '@/lib/supabase-admin';
import { hasAccessToAdminPanel } from '@/lib/roles';

async function checkAdmin(req: NextRequest) {
  const { authenticated, user } = await verifyAuth(req);

  if (!authenticated || !user || !hasAccessToAdminPanel(user.roles)) return null;

  const vaultCookie = req.cookies.get('admin_vault')?.value;
  if (!vaultCookie) return null;

  const isVaultValid = await verifyAdminSession(vaultCookie);
  if (!isVaultValid) return null;

  return user;
}

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized');
    }

    const { data: users, error } = await supabaseAdmin
      .from('tc_sec_u_9b42')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
