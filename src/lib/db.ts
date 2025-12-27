import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createUser(
  email: string,
  name: string,
  hashedPassword: string
) {
  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        id,
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        email_verified: false,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function deleteUserById(id: string) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
}

export async function updateUserProfile(userId: string, name: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ name })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserPassword(userId: string, hashedPassword: string) {
  const { error } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateUserAvatar(userId: string, avatarUrl: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markEmailAsVerified(userId: string) {
  const { error } = await supabase
    .from('users')
    .update({ email_verified: true })
    .eq('id', userId);

  if (error) throw error;
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('verification_tokens')
    .insert([{ token, user_id: userId, expires_at: expiresAt }]);

  if (error) throw error;
  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('verification_tokens')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('verification_tokens').delete().eq('token', token);
    return null;
  }

  await supabase.from('verification_tokens').delete().eq('token', token);
  return data.user_id;
}