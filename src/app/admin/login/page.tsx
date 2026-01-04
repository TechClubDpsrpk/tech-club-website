'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Shield, Fingerprint } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await res.json();
      console.log('🔍 Full API Response:', data);

      if (data.success) {
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Access Denied - Invalid Credentials');
      }
    } catch {
      setError('System Error - Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Main Container */}
      <div className="relative z-10 mt-8 w-full max-w-md px-4">
        {/* Vault Door Design */}
        <div className="relative">
          {/* Outer Vault Ring */}
          <div className="absolute -inset-4 rounded-full border-4 border-[#fac825]/20 blur-sm"></div>
          <div className="absolute -inset-2 rounded-full border-2 border-[#fac825]/30"></div>

          {/* Main Vault Panel */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#fac825]/40 bg-black p-8 shadow-2xl backdrop-blur-xl">
            {/* Metallic Texture Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(250,200,37,0.1),transparent)] opacity-50"></div>

            {/* Top Security Badge */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full border-2 border-red-500 bg-gradient-to-r from-red-950 to-red-900 px-4 py-1.5 shadow-lg">
                <Shield className="h-4 w-4 text-red-400" />
                <span className="text-xs font-bold tracking-widest text-red-400">TOP SECRET</span>
              </div>
            </div>

            {/* Header */}
            <div className="relative mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#fac825]/50 blur-md"></div>
                  <div className="relative flex h-15 w-15 items-center justify-center rounded-full border-4 border-[#fac825]/80 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
                    <Lock className="h-6 w-6 text-[#fac825]" />
                  </div>
                </div>
              </div>

              <h1 className="mb-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                ADMIN ACCESS
              </h1>
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Fingerprint className="h-4 w-4" />
                <p className="text-sm font-medium tracking-wider">Secure access required</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 animate-pulse rounded-lg border-2 border-red-500/50 bg-gradient-to-r from-red-950/80 to-red-900/80 p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <div>
                    <p className="font-bold text-red-400">SECURITY BREACH DETECTED</p>
                    <p className="mt-1 text-sm text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold tracking-widest text-amber-400">
                  AUTHORIZATION CODE
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter security credentials"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                    required
                    className="w-full rounded-lg border-2 border-[#fac825]/30 bg-slate-950/50 px-4 py-3 font-mono text-amber-100 placeholder-slate-600 shadow-inner transition focus:border-[#fac825] focus:bg-slate-950/70 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 transition hover:text-amber-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-lg border-2 border-[#fac825] bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4 font-bold tracking-wider text-slate-950 shadow-lg transition hover:scale-[1.02] hover:shadow-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/20 border-t-slate-950"></div>
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>Access Admin Panel</>
                  )}
                </span>
              </button>
            </div>

            {/* Footer Warning */}
            <div className="mt-8 border-t-2 border-slate-700/50 pt-6">
              <div className="rounded-md border border-slate-700/50 bg-slate-950/50 p-3">
                <p className="text-center text-xs font-medium tracking-wide text-slate-500">
                  Restricted to authorized administrators only.
                </p>
                <p className="mt-1 text-center text-xs text-slate-600">
                  All access attempts are logged and monitored
                </p>
              </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 h-3 w-3 border-t-2 border-l-2 border-[#fac825]/50"></div>
            <div className="absolute top-4 right-4 h-3 w-3 border-t-2 border-r-2 border-[#fac825]/50"></div>
            <div className="absolute bottom-4 left-4 h-3 w-3 border-b-2 border-l-2 border-[#fac825]/50"></div>
            <div className="absolute right-4 bottom-4 h-3 w-3 border-r-2 border-b-2 border-[#fac825]/50"></div>
          </div>
        </div>

        {/* Serial Number */}
        <div className="mt-4 text-center">
          <p className="font-mono text-base tracking-widest text-gray-500">
            T.C.-{new Date().getFullYear()}-{new Date().getMonth() + 1}-{new Date().getDate()}-
            {new Date().getHours()}.{new Date().getMinutes()}.{new Date().getSeconds()}
          </p>
        </div>
      </div>
    </div>
  );
}
