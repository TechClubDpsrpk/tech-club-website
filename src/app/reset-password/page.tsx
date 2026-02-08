'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email') || '';

    const [formData, setFormData] = useState({
        email: emailParam,
        otp: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password-with-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to reset password');
                return;
            }

            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="min-h-full rounded-2xl border border-[#fac825] bg-black p-6 backdrop-blur-xl md:mt-12 md:p-8">
                <h1 className="mb-2 text-center text-3xl text-white md:text-4xl">Set New Password</h1>
                <p className="mb-4 text-center text-sm text-gray-400 md:mb-8 md:text-base">
                    Enter the code sent to your email and your new password
                </p>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-lg border border-green-500/50 bg-green-500/20 p-4 text-sm text-green-200">
                        {success}
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
                        <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">Verification Code</label>
                        <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            placeholder="123456"
                            required
                            maxLength={6}
                            className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base tracking-widest text-center font-mono"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!success}
                        className="mt-2 w-full cursor-pointer rounded-lg bg-[#C9A227] px-3 py-2 text-sm font-semibold text-black transition hover:scale-[101%] hover:bg-[#d4b436] disabled:cursor-not-allowed disabled:opacity-50 md:mt-6 md:px-4 md:py-3 md:text-xl"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="relative h-5 w-5 animate-spin-slow md:h-6 md:w-6">
                                    <Image
                                        src="/tc-logo.svg"
                                        alt="Resetting"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="flex items-center">
                                    UPDATING<LoadingDots />
                                </span>
                            </div>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400 md:text-base">
                    Back to{' '}
                    <Link href="/login" className="text-xl text-[#ab8e30] transition hover:text-[#C9A227]">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

