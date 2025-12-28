'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully! 🎉');
          setTimeout(() => router.push('/account'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <div className="mb-4 inline-block rounded-full bg-[#C9A227]/20 p-4">
                <Loader className="h-8 w-8 animate-spin text-[#C9A227]" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">Verifying email...</h1>
              <p className="text-gray-400">Please wait while we verify your email address</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-4 inline-block rounded-full bg-green-500/20 p-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">Email Verified!</h1>
              <p className="mb-6 text-gray-400">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to your account...</p>
              <div className="mt-4 flex items-center justify-center gap-1">
                <div className="h-2 w-2 rounded-full bg-[#C9A227] animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-[#C9A227] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 rounded-full bg-[#C9A227] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4 inline-block rounded-full bg-red-500/20 p-4">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white">Verification Failed</h1>
              <p className="mb-6 text-gray-400">{message}</p>
              <div className="flex w-full flex-col gap-3">
                <button
                  onClick={() => router.push('/account')}
                  className="rounded-lg bg-[#C9A227] px-6 py-2 font-semibold text-black transition hover:scale-105"
                >
                  Go to Account
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="rounded-lg border border-gray-700 px-6 py-2 font-semibold text-gray-300 transition hover:bg-gray-800"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}