'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { refreshAuth } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      await refreshAuth();
      router.push('/');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="min-h-full rounded-2xl border border-[#fac825] bg-black p-6 backdrop-blur-xl md:mt-12 md:p-8">
          <h1 className="mb-2 text-center text-4xl text-white md:text-5xl">Welcome Back</h1>
          <p className="mb-4 text-center text-sm text-gray-400 md:mb-8 md:text-xl">
            Login to your account
          </p>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-400 hover:text-[#C9A227] transition-colors md:text-sm"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full cursor-pointer rounded-lg bg-[#C9A227] px-3 py-2 text-sm font-semibold text-black transition hover:scale-[101%] hover:bg-[#d4b436] disabled:cursor-not-allowed disabled:opacity-50 md:mt-6 md:px-4 md:py-3 md:text-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="relative h-5 w-5 animate-spin-slow md:h-6 md:w-6">
                    <Image
                      src="/tc-logo.svg"
                      alt="Logging in"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="flex items-center">
                    LOGGING IN<LoadingDots />
                  </span>
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400 md:text-base">
            Don't have an account yet?{' '}
            <Link href="/signup" className="text-xl text-[#ab8e30] transition hover:text-[#C9A227]">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
