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

export async function verifyAuth(req: NextRequest): Promise<{
  authenticated: boolean;
  userId: string | null;
  user?: any;
}> {
  try {
    const token = req.cookies.get('auth')?.value;

    console.log('=== VERIFY AUTH DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('Token (first 20 chars):', token?.substring(0, 20));

    if (!token) {
      console.log('No token found');
      return { authenticated: false, userId: null };
    }

    // Verify JWT first
    let payload;
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload;
      console.log('JWT verified successfully, userId:', payload.id);
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError);
      return { authenticated: false, userId: null };
    }

    const userId = payload.id as string;

    // Check if session exists in database
    const supabase = getSupabaseClient();
    
    console.log('Checking session in DB for userId:', userId);
    
    const { data: sessions, error, count } = await supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .eq('session_token', token)
      .eq('user_id', userId);

    console.log('Database query result:');
    console.log('- Error:', error);
    console.log('- Sessions found:', sessions?.length);
    console.log('- Count:', count);
    console.log('- Sessions data:', JSON.stringify(sessions, null, 2));

    if (error) {
      console.log('Database error occurred:', error);
      return { authenticated: false, userId: null };
    }

    if (!sessions || sessions.length === 0) {
      console.log('No sessions found - user should be logged out');
      return { authenticated: false, userId: null };
    }

    // Check expiration manually
    const now = new Date();
    const validSessions = sessions.filter(s => new Date(s.expires_at) > now);
    console.log('Valid (non-expired) sessions:', validSessions.length);

    if (validSessions.length === 0) {
      console.log('All sessions expired');
      return { authenticated: false, userId: null };
    }

    const user = await getUserById(userId);
    console.log('User found:', !!user);
    console.log('=== END DEBUG ===');

    if (!user) {
      return { authenticated: false, userId: null };
    }

    return { 
      authenticated: true, 
      userId: user.id,
      user 
    };
  } catch (error) {
    console.error('Unexpected error in verifyAuth:', error);
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