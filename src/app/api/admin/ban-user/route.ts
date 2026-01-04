import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';
import { sendBanEmail } from '@/lib/email';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const token = request.cookies.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const adminId = payload.id as string;

    // Check if admin
    const { data: adminData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (!adminData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { userId, reason, durationHours, banIP } = body;

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Calculate expiry date if temporary
    const banExpiresAt = durationHours
      ? new Date(Date.now() + durationHours * 60 * 60 * 1000)
      : null;

    // Ban user
    const { error: banError } = await supabase
      .from('users')
      .update({
        is_banned: true,
        ban_reason: reason,
        banned_at: new Date().toISOString(),
        banned_by: adminId,
        ban_expires_at: banExpiresAt?.toISOString(),
      })
      .eq('id', userId);

    if (banError) {
      console.error('Error banning user:', banError);
      return NextResponse.json(
        { error: 'Failed to ban user' },
        { status: 500 }
      );
    }

    // Ban ALL unique IPs if requested
    let bannedIPCount = 0;
    if (banIP && uniqueIPs.length > 0) {
      const ipBanRecords = uniqueIPs.map(ip => ({
        ip_address: ip,
        reason: reason,
        banned_by: adminId,
        ban_expires_at: banExpiresAt?.toISOString(),
        associated_user_id: userId,
      }));

      const { error: ipBanError } = await supabase
        .from('banned_ips')
        .insert(ipBanRecords);

      if (!ipBanError) {
        bannedIPCount = uniqueIPs.length;
      }
    }

    // Send ban notification email
    try {
      await sendBanEmail(
        userData.email,
        userData.name || 'User',
        reason,
        !!durationHours,
        banExpiresAt || undefined
      );
    } catch (emailError) {
      console.error('Failed to send ban email:', emailError);
      // Don't fail the ban if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'User banned successfully',
      bannedIPs: banIP ? uniqueIPs : [],
      bannedIPCount: bannedIPCount,
    });
  } catch (error) {
    console.error('Error in ban-user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}