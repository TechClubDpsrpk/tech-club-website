export async function loginUser(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  return response;
}

export async function signupUser(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return response;
}

export async function checkAuth() {
  const response = await fetch('/api/auth/check', {
    credentials: 'include',
  });
  return response;
}

export async function logoutUser() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return response;
}
