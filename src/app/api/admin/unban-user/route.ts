import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';
import { sendUnbanEmail } from '@/lib/email';

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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get user data - FIXED: Changed 'username' to 'name'
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

    // Send email - FIXED: Changed 'username' to 'name'
    try {
      await sendUnbanEmail(userData.email, userData.name || 'User');
    } catch (emailError) {
      console.error('Failed to send unban email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'User unbanned successfully',
    });
  } catch (error) {
    console.error('Error in unban-user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}