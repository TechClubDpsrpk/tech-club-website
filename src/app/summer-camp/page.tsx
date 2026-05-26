'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

const TIMELINE_STEPS = [
  {
    week: 'WEEK 01',
    title: 'Foundations & Ideation',
    date: 'July 1 - July 7',
    desc: 'Core track fundamentals, tool configurations, git workflows, and brainstorming product ideas with mentors.',
    status: 'Upcoming',
  },
  {
    week: 'WEEK 02',
    title: 'MVP Construction',
    date: 'July 8 - July 15',
    desc: 'Drafting initial architectures, setting up server routers and state models, and establishing the database layer.',
    status: 'Locked',
  },
  {
    week: 'WEEK 03',
    title: 'Design & Refinement',
    date: 'July 16 - July 23',
    desc: 'Injecting dynamic CSS, animations, fine-tuning user interactions, resolving bugs, and running security audits.',
    status: 'Locked',
  },
  {
    week: 'WEEK 04',
    title: 'DPSRPK Summer Hackathon',
    date: 'July 24 - July 30',
    desc: 'The grand finale. Deploying projects live, designing slideshow presentations, and showcasing products to the jury.',
    status: 'Locked',
  },
];

const QUICK_LINKS = [
  {
    title: 'Official Syllabus',
    desc: 'Download the comprehensive curriculum for your selected track.',
    icon: (
      <svg className="h-6 w-6 text-[#fac825]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Github Classroom',
    desc: 'Connect your project repositories to get automated testing pipelines.',
    icon: (
      <svg className="h-6 w-6 text-[#fac825]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: 'Mentor Sessions',
    desc: 'Schedule dedicated 1-on-1 code reviews with the Tech Club core team.',
    icon: (
      <svg className="h-6 w-6 text-[#fac825]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Resource Vault',
    desc: 'Access curated UI kits, server templates, API databases, and cheat sheets.',
    icon: (
      <svg className="h-6 w-6 text-[#fac825]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
      </svg>
    ),
  },
];

export default function SummerCampPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [registration, setRegistration] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Authenticate and check registration status
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/signup?redirect=/summer-camp');
      return;
    }

    async function checkCampStatus() {
      try {
        const res = await fetch('/api/summer-camp/status');
        const data = await res.json();
        
        if (!data.registered) {
          // If NOT registered, they must sign up first!
          router.push('/summer-camp-signup');
        } else {
          setRegistration(data.registration);
          setCheckingStatus(false);
          
          // Show welcome banner toast if they just registered
          if (searchParams.get('registered') === 'true') {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 5000);
          }
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
        setCheckingStatus(false);
      }
    }

    checkCampStatus();
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isLoading || checkingStatus) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center font-mono">
        <div className="relative mb-4 h-16 w-16 animate-spin-slow">
          <Image src="/tc-logo.svg" alt="Loading" fill className="object-contain" />
        </div>
        <p className="text-sm text-[#fac825] uppercase tracking-widest">
          Authenticating access<LoadingDots />
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-yellow-950/20 via-black to-black p-4 md:p-8 pt-24 md:pt-32">
      
      {/* Toast Alert Success */}
      {showCelebration && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce rounded-xl border border-yellow-500 bg-black/90 p-5 shadow-[0_0_30px_rgba(250,200,37,0.3)] backdrop-blur-md max-w-sm">
          <div className="flex items-start space-x-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-black font-bold">✓</span>
            <div>
              <p className="text-sm font-bold text-white font-mono uppercase tracking-wider">Access Granted!</p>
              <p className="text-xs text-gray-400 mt-0.5">Your summer camp workspace is active. Welcome onboard, {user?.name}!</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl">
        
        {/* Hub Header Block */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center space-x-3">
              <span className="inline-block rounded bg-[#fac825] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black font-mono">
                CAMP PORTAL
              </span>
              <span className="inline-block rounded border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-green-400 font-mono">
                ACCESS ACTIVE
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl uppercase font-sans">
              Summer Camp Hub
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Welcome back, <span className="font-semibold text-white">{user?.name}</span>. Track Specialization: <span className="font-mono text-[#fac825] uppercase font-bold">{registration?.interested_niche}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 max-w-xs md:max-w-none">
            <span className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[#fac825] font-bold font-mono">
              ★
            </span>
            <div>
              <p className="text-xs font-mono uppercase text-gray-500">Global Countdown</p>
              <p className="text-sm font-bold text-gray-300 mt-0.5">LAUNCHING IN 35 DAYS</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Main Workspace Timelines */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-white/5 bg-black/40 p-6 md:p-8 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <h2 className="text-lg font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500 animate-ping" />
                  Syllabus Timeline
                </h2>
                <span className="text-xs text-gray-500 font-mono">DPSRPK Cohort 2026</span>
              </div>

              <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isUpcoming = step.status === 'Upcoming';
                  const isLocked = step.status === 'Locked';
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                        isUpcoming ? 'bg-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(250,200,37,0.5)]' : 'bg-black border-white/20'
                      }`} />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className={`font-mono text-xs font-bold tracking-widest ${
                          isUpcoming ? 'text-[#fac825]' : 'text-gray-500'
                        }`}>
                          {step.week} • {step.date}
                        </span>
                        
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest border ${
                          isUpcoming 
                            ? 'border-yellow-500/30 bg-yellow-500/10 text-[#fac825]' 
                            : 'border-white/10 bg-white/5 text-gray-500'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-bold text-white mt-1.5">{step.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick links & Track specifications */}
          <div className="space-y-8">
            
            {/* Resources Hub Panel */}
            <div className="rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl">
              <h2 className="text-base font-bold uppercase tracking-wider text-white font-mono mb-4 border-b border-white/5 pb-2">
                Developer Resources
              </h2>
              <div className="space-y-4">
                {QUICK_LINKS.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 rounded-lg border border-white/5 bg-white/5 p-3.5 transition-all duration-300 hover:border-yellow-500/30 hover:bg-white/10"
                  >
                    <span className="flex-shrink-0 mt-0.5">{link.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-none">{link.title}</h3>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{link.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application review card */}
            <div className="rounded-2xl border border-yellow-500/10 bg-gradient-to-b from-yellow-950/10 to-transparent p-6 backdrop-blur-xl">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#fac825] font-mono mb-4 border-b border-yellow-500/10 pb-2">
                Your Application Detail
              </h2>
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <p className="text-gray-500 uppercase">Motivation Statement</p>
                  <p className="text-gray-300 mt-1.5 bg-black/40 border border-white/5 p-3 rounded-lg leading-relaxed max-h-24 overflow-y-auto">
                    {registration?.motivation}
                  </p>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-3">
                  <span className="text-gray-500 uppercase">Parental Consent</span>
                  <span className="text-green-400 font-bold">GRANTED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">Availability Guarantee</span>
                  <span className="text-green-400 font-bold">CONFIRMED</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
