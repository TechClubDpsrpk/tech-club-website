import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getUserById } from './db';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Create a reusable Supabase client getter
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function createToken(user: any): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// Verify authentication from NextRequest (for API routes)
export async function verifyAuth(req: NextRequest): Promise<{
  authenticated: boolean;
  userId: string | null;
  user?: any;
}> {
  try {
    const token = req.cookies.get('auth')?.value;

    if (!token) {
      console.log('[verifyAuth] No token found in cookies');
      return { authenticated: false, userId: null };
    }

    // Verify JWT first
    let payload;
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload;
    } catch (jwtError) {
      console.log('[verifyAuth] JWT verification failed:', jwtError);
      return { authenticated: false, userId: null };
    }

    const userId = payload.id as string;

    // Check if session exists in database
    const supabase = getSupabaseClient();
    
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, user_id')
      .eq('session_token', token)
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString());

    // Log for debugging
    console.log('[verifyAuth] Session check:', {
      userId,
      sessionsFound: sessions?.length || 0,
      error: error?.message,
      hasToken: !!token
    });

    // If no sessions found or error, deny access
    if (error || !sessions || sessions.length === 0) {
      console.log('[verifyAuth] No valid session found');
      return { authenticated: false, userId: null };
    }

    // Get user info
    const user = await getUserById(userId);

    if (!user) {
      console.log('[verifyAuth] User not found in database');
      return { authenticated: false, userId: null };
    }

    return { 
      authenticated: true, 
      userId: user.id,
      user 
    };
  } catch (error) {
    console.error('[verifyAuth] Unexpected error:', error);
    return { authenticated: false, userId: null };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;

    if (!token) return null;

    const decoded = await verifyToken(token);
    if (!decoded) return null;

    const userId = decoded.id as string;
    const user = await getUserById(userId);

    return user;
  } catch {
    return null;
  }
}

export async function uploadAvatar(userId: string, file: File) {
  try {
    const supabase = getSupabaseClient();

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // Delete old avatar if exists
    await supabase.storage
      .from('avatars')
      .remove([fileName])
      .catch(() => {});

    // Upload new avatar
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Upload failed: ' + uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
}