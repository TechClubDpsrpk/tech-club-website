'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

const NICHES = [
  'Robotics',
  'Development',
  'Competitive Programming',
  'AI',
  'Videography',
  'Graphics Designing',
];

const CLASSES = ['9', '10', '11', '12'];
const SECTIONS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A to Z

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
    admissionNumber: '',
    githubId: '',
    discordId: '',
    whyJoinTechClub: '',
    skillsAndAchievements: '',
    eventParticipation: '',
    projects: '',
    interestedNiches: [] as string[],
  });
  const { refreshAuth } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

    if (!formData.whyJoinTechClub.trim()) {
      setError('Please tell us why you want to join Tech Club');
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

      await refreshAuth();
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
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

            {/* Email and Phone */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                  Email *
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
                  WhatsApp Number *
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

            {/* Class (Radio) and Section (Dropdown) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Class *</label>
                <div className="grid grid-cols-4 gap-2">
                  {CLASSES.map((cls) => (
                    <label
                      key={cls}
                      className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm transition ${formData.class === cls
                        ? 'border-[#C9A227] bg-[#C9A227]/20 text-[#C9A227]'
                        : 'border-yellow-500/50 bg-gray-900 text-white hover:border-[#C9A227]'
                        }`}
                    >
                      <input
                        type="radio"
                        name="class"
                        value={cls}
                        checked={formData.class === cls}
                        onChange={handleChange}
                        required
                        className="hidden"
                      />
                      {cls}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                  Section *
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white transition focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base"
                >
                  <option value="">Select Section</option>
                  {SECTIONS.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Admission Number */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                Admission Number *
              </label>
              <input
                type="text"
                name="admissionNumber"
                value={formData.admissionNumber}
                onChange={handleChange}
                placeholder="e.g. 12345"
                required
                className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
              />
            </div>

            {/* GitHub ID and Discord ID */}
            <div className="grid gap-4 md:grid-cols-2">
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

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                  Discord ID (Optional)
                </label>
                <input
                  type="text"
                  name="discordId"
                  value={formData.discordId}
                  onChange={handleChange}
                  placeholder="username#1234"
                  className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                  Password *
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
                  Confirm Password *
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

            {/* Interested Niches */}
            <div className="mt-6">
              <label className="mb-3 block text-sm font-medium text-gray-300">
                Interested Niches (Select at least one) *
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

            {/* Why Join Tech Club */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                Why do you want to be a part of Tech Club? *
              </label>
              <textarea
                name="whyJoinTechClub"
                value={formData.whyJoinTechClub}
                onChange={handleChange}
                placeholder="Tell us what motivates you to join..."
                required
                rows={4}
                className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
              />
            </div>

            {/* Skills and Achievements */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                What are your skills and/or achievements in the field of science and technology?
              </label>
              <p className="mb-2 text-xs text-gray-400">
                Also mention your previous experiences. We welcome complete beginners! Feel free to
                skip if you're just starting your tech journey.
              </p>
              <textarea
                name="skillsAndAchievements"
                value={formData.skillsAndAchievements}
                onChange={handleChange}
                placeholder="Share your skills, achievements, or type 'Beginner' if you're just starting..."
                rows={4}
                className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
              />
            </div>

            {/* Event Participation */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                Do you want to participate in events? If yes, what kind(s)? *
              </label>
              <p className="mb-2 text-xs text-gray-400">
                For example: workshops for beginners, hackathons on Data Science or Web development,
                inter-school fests like Competitive Programming.
              </p>
              <textarea
                name="eventParticipation"
                value={formData.eventParticipation}
                onChange={handleChange}
                placeholder="Describe the types of events you'd like to participate in, or type 'No' if not interested..."
                required
                rows={3}
                className="w-full rounded-md border border-yellow-500/50 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-400 transition placeholder:text-sm focus:border-[#C9A227] focus:bg-gray-800 focus:outline-none md:px-4 md:py-3 md:text-base md:placeholder:text-base"
              />
            </div>

            {/* Projects */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300 md:mb-2">
                Do you have any projects, including GitHub links, that you can share? (Optional)
              </label>
              <textarea
                name="projects"
                value={formData.projects}
                onChange={handleChange}
                placeholder="Share your project links or descriptions..."
                rows={3}
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
                      alt="Signing up"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="flex items-center">
                    CREATING ACCOUNT<LoadingDots />
                  </span>
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

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
