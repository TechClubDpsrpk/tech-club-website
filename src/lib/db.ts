const users = new Map<string, any>();
const verificationTokens = new Map<string, { userId: string; expiresAt: number }>();

export async function findUserByEmail(email: string) {
  for (const user of users.values()) {
    if (user.email === email) return user;
  }
  return null;
}

export async function createUser(email: string, name: string, hashedPassword: string) {
  const id = crypto.randomUUID();
  const user = {
    id,
    email,
    name,
    password: hashedPassword,
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  return user;
}

export async function getUserById(id: string) {
  return users.get(id) || null;
}

export async function createVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  verificationTokens.set(token, {
    userId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const data = verificationTokens.get(token);
  if (!data) return null;

  if (Date.now() > data.expiresAt) {
    verificationTokens.delete(token);
    return null;
  }

  verificationTokens.delete(token);
  return data.userId;
}

export async function markEmailAsVerified(userId: string) {
  const user = users.get(userId);
  if (user) {
    user.emailVerified = true;
  }
}
