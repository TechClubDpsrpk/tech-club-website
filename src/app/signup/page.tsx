'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NICHES = [
  'Robotics',
  'Development',
  'Competitive Programming',
  'AI',
  'Videography',
  'Graphics Designing',
];

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    class: '',
    section: '',
    phoneNumber: '',
    githubId: '',
    interestedNiches: [] as string[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNicheToggle = (niche: string) => {
    setFormData((prev) => ({
      ...prev,
      interestedNiches: prev.interestedNiches.includes(niche)
        ? prev.interestedNiches.filter((n) => n !== niche)
        : [...prev.interestedNiches, niche],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.interestedNiches.length === 0) {
      setError('Please select at least one niche');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      router.push('/account?newSignup=true');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-5xl">
        <div className="mb-10 rounded-2xl border border-[#fac825] bg-black p-6 backdrop-blur-xl md:mt-20 md:p-8">
          <h1 className="mb-2 text-center text-2xl text-white md:text-5xl">Create Account</h1>
          <p className="mb-6 text-center text-sm text-gray-400 md:mb-8 md:text-xl">
            Join the tech club today
          </p>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                  Email
                </label>
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                  Class
                </label>
                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  placeholder="e.g. 10, 11"
                  required
                  className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="e.g. A, B"
                  required
                  className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                GitHub ID (Optional)
              </label>
              <input
                type="text"
                name="githubId"
                value={formData.githubId}
                onChange={handleChange}
                placeholder="your-github-username"
                className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                  minLength={8}
                  className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
                />
                <p className="mt-1 text-xs text-gray-400">Min 8 characters</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                  Confirm Password
                </label>
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
            </div>

            <div className="mt-6">
              <label className="mb-3 block text-sm font-medium text-gray-300">
                Interested Niches (Select at least one)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {NICHES.map((niche) => (
                  <label key={niche} className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.interestedNiches.includes(niche)}
                      onChange={() => handleNicheToggle(niche)}
                      className="h-4 min-h-4 w-4 min-w-4 rounded border-gray-600 bg-gray-700 accent-[#C9A227]"
                    />
                    <span className="text-[10px] text-gray-300 md:text-base">{niche}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 w-full cursor-pointer rounded-lg bg-[#C9A227] px-3 py-2 text-sm font-semibold text-black transition hover:scale-[101%] hover:bg-[#d4b436] disabled:cursor-not-allowed disabled:opacity-50 md:mt-6 md:px-4 md:py-3 md:text-xl"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-400 md:mt-6 md:text-base">
            Already have an account?{' '}
            <Link href="/login" className="text-xl text-[#ab8e30] transition hover:text-[#C9A227]">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
