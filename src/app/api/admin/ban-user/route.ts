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

    // Get user data - FIXED: Changed 'username' to 'name'
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name, last_ip')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

    // Ban IP if requested
    if (banIP && userData.last_ip) {
      await supabase.from('banned_ips').insert({
        ip_address: userData.last_ip,
        reason: reason,
        banned_by: adminId,
        ban_expires_at: banExpiresAt?.toISOString(),
        associated_user_id: userId,
      });
    }

    // Send email - FIXED: Changed 'username' to 'name'
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
      bannedIP: banIP ? userData.last_ip : null,
    });
  } catch (error) {
    console.error('Error in ban-user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}