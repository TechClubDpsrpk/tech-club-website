import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
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
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fileName = `${userId}/${Date.now()}-${file.name}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, buffer, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

  return data.publicUrl;
}