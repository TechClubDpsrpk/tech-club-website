import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getUserById } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function createToken(user: any): Promise<string> {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return token;
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

// NEW: Verify authentication from NextRequest (for API routes)
export async function verifyAuth(req: NextRequest): Promise<{
  authenticated: boolean;
  userId: string | null;
  user?: any;
}> {
  try {
    const token = req.cookies.get('auth')?.value;

    if (!token) {
      return { authenticated: false, userId: null };
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return { authenticated: false, userId: null };
    }

    const userId = (decoded as any).id;
    const user = await getUserById(userId);

    if (!user) {
      return { authenticated: false, userId: null };
    }

    return { 
      authenticated: true, 
      userId: user.id,
      user 
    };
  } catch (error) {
    console.error('Auth verification error:', error);
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

    const userId = (decoded as any).id;
    const user = await getUserById(userId);

    return user;
  } catch {
    return null;
  }
}

export async function uploadAvatar(userId: string, file: File) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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