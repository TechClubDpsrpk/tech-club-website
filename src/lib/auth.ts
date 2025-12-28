import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserById } from './db';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const JWT_SECRET_VALUE = JWT_SECRET as string;

export async function createToken(user: any): Promise<string> {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET_VALUE,
    { expiresIn: '7d' }
  );

  return token;
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_VALUE);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;

    if (!token) {
      console.log('No auth token found in cookies');
      return null;
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log('Token verification failed');
      return null;
    }

    // Token is valid, return decoded user data directly
    return {
      id: (decoded as any).id,
      email: (decoded as any).email,
      name: 'Admin',
      email_verified: true,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
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