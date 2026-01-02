// app/site-login/page.tsx (Create this new file)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SiteLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/site-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to home page
        router.push('/');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-black to-yellow-600/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Gold accent line */}
        <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-yellow-600 mb-8 mx-auto"></div>
        
        <div className="bg-gradient-to-br from-zinc-900 to-black rounded-xl shadow-2xl p-8 border border-yellow-500/20 backdrop-blur-sm">
          {/* Tech club branding */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-3">
              Tech Club
            </h1>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mb-4"></div>
            <p className="text-gray-400 text-sm uppercase tracking-wider">
              Authorized Access Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-yellow-400 mb-2">
                Access Code
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                <span className="font-semibold">Access Denied:</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-700 disabled:to-gray-800 text-black disabled:text-gray-400 font-bold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black shadow-lg shadow-yellow-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Access Site'
              )}
            </button>
          </form>
        </div>

        {/* Bottom accent */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-xs uppercase tracking-wider">
            Secure Access Portal
          </p>
        </div>
      </div>
    </div>
  );
}