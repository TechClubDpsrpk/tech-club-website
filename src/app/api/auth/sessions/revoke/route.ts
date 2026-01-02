import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, revokeAll } = await req.json();

    if (revokeAll) {
      // Revoke all sessions except current one
      const currentSessionToken = req.cookies.get('session')?.value;
      
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('user_id', authResult.userId)
        .neq('session_token', currentSessionToken);

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        message: 'All other sessions revoked' 
      });
    } else if (sessionId) {
      // Revoke specific session
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', authResult.userId);

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        message: 'Session revoked' 
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error revoking session:', error);
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
  }
}