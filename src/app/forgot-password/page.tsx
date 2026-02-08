'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

function ForgotPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Default to empty string if null
    const emailParam = searchParams.get('email') || '';

    // Initialize state with the email param
    const [email, setEmail] = useState(emailParam);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoSendTriggered, setAutoSendTriggered] = useState(false);

    // Effect to handle auto-sending if email is present
    useEffect(() => {
        if (emailParam && !autoSendTriggered) {
            // We set the email state again just to be sure
            setEmail(emailParam);
            // Trigger auto-send logic
            handleAutoSend(emailParam);
            setAutoSendTriggered(true);
        }
    }, [emailParam, autoSendTriggered]);

    const handleAutoSend = async (emailToSend: string) => {
        setLoading(true);
        // We do strictly the same logic as handleSubmit but with the passed email
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToSend }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to send reset email');
                setLoading(false); // Stop loading if error
                return;
            }

            // Navigate to reset page
            router.push(`/reset-password?email=${encodeURIComponent(emailToSend)}`);

        } catch {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to send reset email');
                return;
            }

            router.push(`/reset-password?email=${encodeURIComponent(email)}`);

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
                    <h1 className="mb-2 text-center text-3xl text-white md:text-4xl">Reset Password</h1>
                    <p className="mb-4 text-center text-sm text-gray-400 md:mb-8 md:text-base">
                        {loading && emailParam ? 'Sending verification code...' : 'Enter your email to receive a reset code'}
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                readOnly={!!(loading && emailParam)} // Lock input if auto-sending
                                className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
                            />
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
                                            alt="Sending"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="flex items-center">
                                        SENDING<LoadingDots />
                                    </span>
                                </div>
                            ) : (
                                'Send Code'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400 md:text-base">
                        Remember your password?{' '}
                        <Link href="/login" className="text-xl text-[#ab8e30] transition hover:text-[#C9A227]">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <ForgotPasswordForm />
        </Suspense>
    );
}
