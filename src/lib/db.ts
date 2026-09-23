import { supabaseAdmin as supabase } from './supabase-admin';

if (!supabase) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY missing in db.ts, fallback operations may fail with RLS');
}

interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  phoneNumber: string;
  class: string;
  section: string;
  admissionNumber: string;
  githubId: string | null;
  discordId: string | null;
  whyJoinTechClub: string;
  skillsAndAchievements: string | null;
  eventParticipation: string;
  projects: string | null;
  interestedNiches: string[];
  roles?: string[];
}

interface UpdateProfileInput {
  name: string;
  phoneNumber: string;
  class: string;
  section: string;
  admissionNumber: string;
  githubId: string | null;
  discordId: string | null;
  interestedNiches: string[];
}

function getDbClient() {
  if (!supabase) {
    throw new Error('Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY missing');
  }
  return supabase;
}

export async function findUserByEmail(email: string) {
  const { data, error } = await getDbClient()
    .from('tc_sec_u_9b42')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createUser(userData: CreateUserInput) {
  // ... (keeping existing createUser implementation)
  const {
    email,
    name,
    passwordHash,
    phoneNumber,
    class: userClass,
    section,
    admissionNumber,
    githubId,
    discordId,
    whyJoinTechClub,
    skillsAndAchievements,
    eventParticipation,
    projects,
    interestedNiches,
    roles,
  } = userData;

  const id = crypto.randomUUID();
  const { data, error } = await getDbClient()
    .from('tc_sec_u_9b42')
    .insert([
      {
        id,
        email: email.toLowerCase(),
        name,
        password: passwordHash,
        phone_number: phoneNumber,
        class: userClass,
        section,
        admission_number: admissionNumber,
        github_id: githubId,
        discord_id: discordId,
        why_join_tech_club: whyJoinTechClub,
        skills_and_achievements: skillsAndAchievements,
        event_participation: eventParticipation,
        projects: projects,
        interested_niches: interestedNiches,
        email_verified: false,
        is_approved: false,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ... (keeping other existing exports)

export async function getUserById(id: string) {
  const { data, error } = await getDbClient()
    .from('tc_sec_u_9b42')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function deleteUserById(id: string) {
  const { error } = await getDbClient().from('tc_sec_u_9b42').delete().eq('id', id);
  if (error) throw error;
}

export async function updateUserProfile(userId: string, data: UpdateProfileInput) {
  const {
    name,
    phoneNumber,
    class: userClass,
    section,
    admissionNumber,
    githubId,
    discordId,
    interestedNiches,
  } = data;

  const { data: updatedUser, error } = await getDbClient()
    .from('tc_sec_u_9b42')
    .update({
      name,
      phone_number: phoneNumber,
      class: userClass,
      section,
      admission_number: admissionNumber,
      github_id: githubId,
      discord_id: discordId,
      interested_niches: interestedNiches,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return updatedUser;
}

export async function updateUserPassword(userId: string, hashedPassword: string) {
  const { error } = await getDbClient()
    .from('tc_sec_u_9b42')
    .update({ password: hashedPassword })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateUserAvatar(userId: string, avatarUrl: string) {
  const { data, error } = await getDbClient()
    .from('tc_sec_u_9b42')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserNiches(userId: string, interestedNiches: string[]) {
  const { data, error } = await getDbClient()
    .from('tc_sec_u_9b42')
    .update({ interested_niches: interestedNiches })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markEmailAsVerified(userId: string) {
  const { error } = await getDbClient()
    .from('tc_sec_u_9b42')
    .update({ email_verified: true })
    .eq('id', userId);

  if (error) throw error;
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error } = await getDbClient()
    .from('tc_sec_otp_6d19')
    .insert([{ token, user_id: userId, expires_at: expiresAt }]);

  if (error) throw error;
  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const { data, error } = await getDbClient()
    .from('tc_sec_otp_6d19')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  if (new Date(data.expires_at) < new Date()) {
    await getDbClient().from('tc_sec_otp_6d19').delete().eq('token', token);
    return null;
  }

  await getDbClient().from('tc_sec_otp_6d19').delete().eq('token', token);
  return data.user_id;
}

// Helper to format a 6-digit OTP into a UUID-compatible string
// The verification_tokens table requires a UUID, so we pad the OTP.
// Format: 00000000-0000-0000-0000-000000xxxxxx
function formatOtpAsUuid(otp: string): string {
  return `00000000-0000-0000-0000-000000${otp}`;
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const client = getDbClient();

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenUuid = formatOtpAsUuid(otp);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes expiry

  // First, delete any existing tokens for this user to prevent multiple valid OTPs
  await client
    .from('tc_sec_otp_6d19')
    .delete()
    .eq('user_id', userId);

  const { error } = await client
    .from('tc_sec_otp_6d19')
    .insert([{ token: tokenUuid, user_id: userId, expires_at: expiresAt }]);

  if (error) throw error;
  return otp;
}

export async function verifyPasswordResetToken(userIdOrEmail: string, otp: string, isEmail = false): Promise<string | null> {
  const client = getDbClient();

  let userId = userIdOrEmail;

  console.log('--- DEBUG: verifyPasswordResetToken ---');
  console.log(`Input: userIdOrEmail=${userIdOrEmail}, otp=${otp}, isEmail=${isEmail}`);

  if (isEmail) {
    const user = await findUserByEmail(userIdOrEmail);
    if (!user) {
      console.log('DEBUG: User not found via email');
      return null;
    }
    userId = user.id;
    console.log(`DEBUG: Resolved user ID: ${userId}`);
  }

  const tokenUuid = formatOtpAsUuid(otp);
  console.log(`DEBUG: Generated UUID from OTP: ${tokenUuid}`);

  const { data, error } = await client
    .from('tc_sec_otp_6d19')
    .select('user_id, expires_at')
    .eq('token', tokenUuid)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.log('DEBUG: Database error or no rows found:', error);
  } else {
    console.log('DEBUG: Token found:', data);
  }

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) {
    console.log('DEBUG: No data returned');
    return null;
  }

  // Handle potential timezone issue. Supabase/Postgres might return string without Z.
  // We generated it with toISOString() (UTC), so we must treat it as UTC.
  let expiresAtStr = data.expires_at;
  let expiresAtStrOriginal = data.expires_at;

  if (!expiresAtStr.endsWith('Z') && !expiresAtStr.includes('+')) {
    expiresAtStr += 'Z';
  }

  const expiresDate = new Date(expiresAtStr);
  const now = new Date();

  console.log('DEBUG: Date Check:', {
    originalFromDB: expiresAtStrOriginal,
    processedStr: expiresAtStr,
    parsedExpiresDate: expiresDate.toISOString(),
    nowDate: now.toISOString(),
    nowTime: now.getTime(),
    expiresTime: expiresDate.getTime(),
    isExpired: expiresDate < now,
    diffSeconds: (expiresDate.getTime() - now.getTime()) / 1000
  });

  if (expiresDate < now) {
    console.log(`DEBUG: Token expired.`);
    await client.from('tc_sec_otp_6d19').delete().eq('token', tokenUuid);
    return null;
  }

  console.log('DEBUG: Token is valid');
  return data.user_id;
}
