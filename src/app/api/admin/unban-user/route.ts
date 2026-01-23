import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendUnbanEmail } from '@/lib/email';
import { verifyAuth } from '@/lib/auth';
import { hasAccessToAdminPanel } from '@/lib/roles';

export async function POST(request: NextRequest) {
  try {
    const { authenticated, user: adminUser } = await verifyAuth(request);

    if (!authenticated || !adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasAccessToAdminPanel(adminUser.roles)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get ALL unique IPs from user's sessions
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('ip_address')
      .eq('user_id', userId);

    // Get unique IPs (remove duplicates and 'unknown')
    const uniqueIPs = sessionData
      ? [...new Set(sessionData.map(s => s.ip_address))]
        .filter(ip => ip && ip !== 'unknown')
      : [];

    // Unban user
    const { error: unbanError } = await supabase
      .from('users')
      .update({
        is_banned: false,
        ban_reason: null,
        banned_at: null,
        banned_by: null,
        ban_expires_at: null,
      })
      .eq('id', userId);

    if (unbanError) {
      console.error('Error unbanning user:', unbanError);
      return NextResponse.json(
        { error: 'Failed to unban user' },
        { status: 500 }
      );
    }

    // Unban all associated IPs
    let unbannedIPCount = 0;
    if (uniqueIPs.length > 0) {
      const { error: ipUnbanError, count } = await supabase
        .from('banned_ips')
        .delete()
        .in('ip_address', uniqueIPs);

      if (!ipUnbanError && count) {
        unbannedIPCount = count;
      }
    }

    // Also unban any IPs directly associated with this user
    const { count: directUnbanCount } = await supabase
      .from('banned_ips')
      .delete()
      .eq('associated_user_id', userId);

    if (directUnbanCount) {
      unbannedIPCount += directUnbanCount;
    }

    // Send unban email
    try {
      await sendUnbanEmail(userData.email, userData.name || 'User');
    } catch (emailError) {
      console.error('Failed to send unban email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'User unbanned successfully',
      unbannedIPs: uniqueIPs,
      unbannedIPCount: unbannedIPCount,
    });
  } catch (error) {
    console.error('Error in unban-user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}