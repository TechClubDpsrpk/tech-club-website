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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black pt-2 pr-4 pl-4 md:pt-4">
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-4 md:mt-24">
        {/* Vault Door Design */}
        <div className="relative">
          {/* Outer Vault Ring */}
          <div className="absolute -inset-4 rounded-full border-4 border-[#fac825]/50 blur-sm"></div>
          <div className="absolute -inset-2 rounded-full border-2 border-[#fac825]/50"></div>

          {/* Main Vault Panel */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#fac825]/80 bg-black p-4 shadow-2xl backdrop-blur-xl md:p-8">
            {/* Metallic Texture Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(250,200,37,0.1),transparent)] opacity-50"></div>

            {/* Top Security Badge */}
            <div className="absolute -top-5 left-1/2 w-30 -translate-x-1/2 md:w-60">
              <div className="flex items-center gap-2 rounded-full border-2 border-red-500 bg-gradient-to-r from-red-950 to-red-900 px-4 py-1.5 shadow-lg">
                <span className="text-xs font-bold tracking-widest text-red-400">
                  AUTHORIZATION
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="relative mb-6 text-center">
              <h1 className="mt-5 mb-1 bg-[#ffffff] bg-clip-text text-xl font-bold tracking-tight text-transparent md:mb-2 md:text-2xl">
                ADMIN ACCESS
              </h1>
              <div className="flex items-center justify-center gap-1 text-slate-400 md:gap-2">
                <Fingerprint className="h-2 w-2 md:h-4 md:w-4" />
                <p className="text-[10px] md:text-sm">Secure access required</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 animate-pulse rounded-lg border-2 border-red-500/50 bg-red-950 pt-1 pb-1 pl-3 shadow-lg md:mb-6 md:pt-2 md:pb-2 md:pl-4">
                <div className="flex items-start gap-3 text-[12px] md:text-base">
                  <div>
                    <p className="font-bold text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs tracking-wide text-yellow-400 md:tracking-widest">
                  AUTHORIZATION CODE
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="ACCESS CODE"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                    required
                    className="w-full rounded-md border border-yellow-500/50 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-400 placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-900 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition hover:text-yellow-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="mt-1 w-full cursor-pointer rounded-lg bg-[#C9A227] px-3 py-2 text-sm font-semibold text-black transition hover:scale-[101%] hover:bg-[#d4b436] disabled:cursor-not-allowed disabled:opacity-50 md:mt-2 md:px-4 md:py-3 md:text-xl"
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
            <div className="mt-4 border-t-2 border-slate-700/50 pt-4">
              <div className="rounded-md border border-slate-700/50 bg-slate-950/50 p-3">
                <p className="text-center text-[10px] font-medium tracking-wide text-slate-500 md:text-xs">
                  Authorized Administrators Only.
                </p>
                <p className="mt-1 text-center text-[10px] text-slate-600 md:text-xs">
                  All access attempts are logged and monitored
                </p>
              </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 h-0 w-0 border-t-2 border-[#fac825]/50 md:h-3 md:w-3 md:border-l-2"></div>
            <div className="absolute top-4 right-4 h-0 w-0 border-t-2 border-[#fac825]/50 md:h-3 md:w-3 md:border-r-2"></div>
            <div className="absolute bottom-4 left-4 h-0 w-0 border-b-2 border-[#fac825]/50 md:h-3 md:w-3 md:border-l-2"></div>
            <div className="absolute right-4 bottom-4 h-0 w-0 border-r-2 border-[#fac825]/50 md:h-3 md:w-3 md:border-b-2"></div>
          </div>
        </div>

        {/* Serial Number */}
        <div className="mt-4 text-center">
          <p className="font-mono text-xs tracking-wide text-gray-500 md:text-sm md:tracking-wider">
            TECH-CLUB-DPSRPK-2026
          </p>
        </div>
      </div>
    </div>
  );
}
