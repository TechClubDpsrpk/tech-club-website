'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

const CAMP_TRACKS = [
  {
    id: 'AI',
    name: 'Artificial Intelligence',
    desc: 'Build smart neural networks, explore LLMs, and craft AI agents that solve real problems.',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
    hoverColor: 'hover:border-purple-400/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    activeColor: 'border-purple-500 bg-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.3)]',
  },
  {
    id: 'Development',
    name: 'Software Development',
    desc: 'Design full-stack applications with Next.js, explore cloud services, and write clean scalable code.',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    hoverColor: 'hover:border-blue-400/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    activeColor: 'border-blue-500 bg-blue-500/20 shadow-[0_0_25px_rgba(59,130,246,0.3)]',
  },
  {
    id: 'Robotics',
    name: 'Robotics & Hardware',
    desc: 'Integrate physical microcontrollers, configure sensors, and program machines to interact with the world.',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    hoverColor: 'hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    activeColor: 'border-amber-500 bg-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.3)]',
  },
  {
    id: 'Competitive Programming',
    name: 'Competitive Programming',
    desc: 'Master advanced algorithms, dynamic programming, and optimize mathematical logic to crack complex challenges.',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    hoverColor: 'hover:border-emerald-400/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    activeColor: 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.3)]',
  },
  {
    id: 'Graphics Designing',
    name: 'Graphics & Visual Design',
    desc: 'Craft premium digital artwork, design interfaces, and build visually compelling brand systems.',
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
    hoverColor: 'hover:border-pink-400/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]',
    activeColor: 'border-pink-500 bg-pink-500/20 shadow-[0_0_25px_rgba(236,72,153,0.3)]',
  },
  {
    id: 'Videography',
    name: 'Videography & Media',
    desc: 'Learn visual storytelling, cinematic camera work, advanced video editing, and special effects.',
    color: 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400',
    hoverColor: 'hover:border-red-400/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    activeColor: 'border-red-500 bg-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.3)]',
  },
];

export default function SummerCampSignupPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('');
  const [motivation, setMotivation] = useState('');
  const [availability, setAvailability] = useState(false);
  const [consent, setConsent] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Authenticate and check registration status
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signup?redirect=/summer-camp-signup');
      return;
    }

    async function checkCampStatus() {
      try {
        const res = await fetch('/api/summer-camp/status');
        const data = await res.json();
        
        if (data.registered) {
          // Already registered, go directly to the summer camp hub
          router.push('/summer-camp');
        } else {
          setCheckingStatus(false);
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
        setCheckingStatus(false);
      }
    }

    checkCampStatus();
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedTrack) {
      setError('Please select a focus track for the camp.');
      return;
    }

    if (!motivation.trim()) {
      setError('Please enter why you want to join.');
      return;
    }

    if (!availability || !consent) {
      setError('Please confirm availability and parent/guardian consent.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/summer-camp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interestedNiche: selectedTrack,
          motivation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/summer-camp?registered=true');
      }, 2000);
    } catch (err) {
      setError('An error occurred during submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || checkingStatus) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center font-mono">
        <div className="relative mb-4 h-16 w-16 animate-spin-slow">
          <Image src="/tc-logo.svg" alt="Loading" fill className="object-contain" />
        </div>
        <p className="text-sm text-[#fac825] uppercase tracking-widest">
          Securing connection<LoadingDots />
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-950/20 via-black to-black p-4 md:p-8 pt-24 md:pt-32">
      <div className="mx-auto w-full max-w-4xl">
        
        {/* Header Block */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#fac825] shadow-[0_0_15px_rgba(250,200,37,0.1)]">
            SUMMER CAMP 2026
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-6xl uppercase font-sans">
            Level Up Your Skills
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400 md:text-lg leading-relaxed">
            Our exclusive summer cohort launches this July. Prefilled for verified Tech Club members. Complete your application below.
          </p>
        </div>

        {/* Info Message */}
        <div className="mb-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 md:p-6 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <svg className="h-5 w-5 text-[#fac825]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <div>
              <p className="text-xs md:text-sm font-semibold uppercase text-[#fac825] font-mono tracking-wider">Verified Member Detected</p>
              <p className="text-xs text-gray-400">Welcome, {user?.name}. Your club profiles details are automatically linked.</p>
            </div>
          </div>
        </div>

        {/* Errors & Success */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-mono text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <div className="flex items-center space-x-2">
              <span>✗</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-sm font-mono text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <div className="flex items-center space-x-3">
              <span className="animate-ping">✓</span>
              <div>
                <p className="font-bold text-white uppercase tracking-wider">Application Received!</p>
                <p className="text-xs text-gray-400 mt-1">Redirecting you to the Member Portal Hub...</p>
              </div>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-yellow-500/10 bg-black/40 p-6 md:p-10 backdrop-blur-xl">
          
          {/* Prefilled Grid (Read Only Profile) */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono mb-4 border-b border-white/5 pb-2">
              I. Member Account Details (Linked)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3">
                <p className="text-[10px] uppercase font-mono text-gray-500">Name</p>
                <p className="text-sm font-semibold text-gray-300 mt-0.5">{user?.name}</p>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3">
                <p className="text-[10px] uppercase font-mono text-gray-500">Email Address</p>
                <p className="text-sm font-semibold text-gray-300 mt-0.5 truncate">{user?.email}</p>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3">
                <p className="text-[10px] uppercase font-mono text-gray-500">WhatsApp Phone</p>
                <p className="text-sm font-semibold text-gray-300 mt-0.5">{user?.phone_number}</p>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3">
                <p className="text-[10px] uppercase font-mono text-gray-500">Class & Section</p>
                <p className="text-sm font-semibold text-gray-300 mt-0.5">{user?.class}-{user?.section}</p>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3">
                <p className="text-[10px] uppercase font-mono text-gray-500">Admission Number</p>
                <p className="text-sm font-semibold text-gray-300 mt-0.5">{user?.admission_number}</p>
              </div>
              <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-mono text-gray-500">Tech Club Member</p>
                  <p className="text-sm font-bold text-[#fac825] mt-0.5">ACTIVE</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_10px_#fac825]" />
              </div>
            </div>
          </div>

          {/* Specialization selector */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono mb-2 border-b border-white/5 pb-2">
              II. Select Focus Track *
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              Choose the dedicated focus track you want to commit to. Mentorship and cohort challenges will center around this field.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {CAMP_TRACKS.map((track) => {
                const isActive = selectedTrack === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setSelectedTrack(track.id)}
                    className={`flex flex-col text-left rounded-xl border bg-gradient-to-b p-5 transition-all duration-300 cursor-pointer ${
                      isActive ? track.activeColor : `${track.color} ${track.hoverColor} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <span className="font-mono text-xs uppercase tracking-widest text-[#fac825] font-semibold">
                      {track.id}
                    </span>
                    <span className="text-base font-bold text-white mt-1">
                      {track.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-2 leading-relaxed">
                      {track.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motivation Textarea */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono mb-2 border-b border-white/5 pb-2">
              III. Application Statement *
            </h2>
            <label className="mb-2 block text-xs text-gray-400 leading-relaxed">
              Why do you want to participate in the Summer Camp? Tell us what project ideas you have, what you hope to learn, and any prior skills you want to build upon.
            </label>
            <textarea
              name="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="I want to join this cohort to deepen my skills in development. I'm aiming to build a serverless dashboard..."
              required
              rows={4}
              className="w-full rounded-lg border border-yellow-500/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-[#fac825] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#fac825]"
            />
          </div>

          {/* Confirmations & Consents */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono mb-4 border-b border-white/5 pb-2">
              IV. Declarations
            </h2>
            <div className="space-y-4">
              
              {/* Check 1 */}
              <label className="flex cursor-pointer items-start space-x-3 rounded-lg border border-white/5 bg-white/5 p-4 transition hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={availability}
                  onChange={(e) => setAvailability(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-600 bg-gray-700 accent-[#fac825] mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="text-xs md:text-sm font-bold text-white uppercase font-mono tracking-wide">Cohort Availability Guarantee</span>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    I confirm that I will be available for online lectures, active work, and collaborative hackathons for the duration of the Summer Camp.
                  </p>
                </div>
              </label>

              {/* Check 2 */}
              <label className="flex cursor-pointer items-start space-x-3 rounded-lg border border-white/5 bg-white/5 p-4 transition hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-600 bg-gray-700 accent-[#fac825] mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="text-xs md:text-sm font-bold text-white uppercase font-mono tracking-wide">Parental / Guardian Consent Obtained</span>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    I declare that my parents/legal guardians have consented to my participation in the Tech Club Summer Camp 2026.
                  </p>
                </div>
              </label>

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#fac825] to-[#d4b436] px-4 py-3 text-sm md:text-base font-bold uppercase tracking-wider text-black transition-all hover:scale-[100.5%] hover:shadow-[0_0_20px_rgba(250,200,37,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="relative h-5 w-5 animate-spin">
                  <Image src="/tc-logo.svg" alt="Loading" fill className="object-contain" />
                </div>
                <span>SUBMITTING REGISTRATION...</span>
              </div>
            ) : (
              'Submit Summer Camp Application'
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
