import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyAuth } from '@/lib/auth';
import UAParser from 'ua-parser-js';

// Helper function to extract IP address
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentSessionToken = req.cookies.get('auth')?.value;
    const currentIP = getClientIP(req);

    // Update current session's last_active_at and IP
    if (currentSessionToken) {
      await supabase
        .from('sessions')
        .update({ 
          last_active_at: new Date().toISOString(),
          ip_address: currentIP
        })
        .eq('session_token', currentSessionToken)
        .eq('user_id', authResult.userId);
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Delete the session (ensuring it belongs to the user)
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', authResult.userId);

    if (error) throw error;

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}