'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify admin password
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to admin dashboard
        router.replace('/admin');
      } else {
        setError(data.error || 'Incorrect password');
      }
    } catch {
      setError('Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 shadow-xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="rounded-full bg-[#C9A227]/20 p-3">
              <Shield size={24} className="text-[#C9A227]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-gray-400">Secure access required</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 px-4 py-3 text-sm text-red-200">
              <p className="font-medium">Access Denied</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-600/50 bg-gray-900/60 px-4 py-3 pr-12 text-white placeholder-gray-500 transition focus:border-[#C9A227] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#C9A227] px-4 py-3 font-semibold text-black transition hover:scale-105 hover:bg-[#d4b436] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#C9A227]/20"
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-gray-700/50 pt-6">
            <p className="text-center text-sm text-gray-500">
              🔐 This area is restricted to authorized administrators only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}