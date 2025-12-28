import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop() || 'png';
  const filePath = `${userId}/avatar.${fileExt}`;

  await supabase.storage
    .from('avatars')
    .remove([filePath])
    .catch(() => {});

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
