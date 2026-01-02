import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyAuth } from '@/lib/auth';
import UAParser from 'ua-parser-js';

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentSessionToken = req.cookies.get('session')?.value;

    // Clean up expired sessions first
    await supabase
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Get all active sessions
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', authResult.userId)
      .gte('expires_at', new Date().toISOString())
      .order('last_active_at', { ascending: false });

    if (error) throw error;

    // Mark current session
    const enrichedSessions = sessions?.map(session => ({
      ...session,
      is_current: session.session_token === currentSessionToken
    })) || [];

    return NextResponse.json({ sessions: enrichedSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}