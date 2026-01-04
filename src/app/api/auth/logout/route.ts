import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth')?.value;
    
    // Delete session from database if token exists
    if (token) {
      try {
        await supabase
          .from('sessions')
          .delete()
          .eq('session_token', token);
      } catch (dbError) {
        console.error('Failed to delete session from database:', dbError);
        // Continue with logout even if database deletion fails
      }
    }

    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    response.cookies.set('auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/', // Important: clear from all paths
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}