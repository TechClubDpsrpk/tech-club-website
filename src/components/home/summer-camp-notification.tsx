'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/auth-provider';

export default function SummerCampNotification() {
  const { isAuthenticated, isLoading: loading } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    // Don't show if user explicitly dismissed it before
    if (typeof window !== 'undefined' && localStorage.getItem('camp_notif_dismissed') === 'true') {
      return;
    }

    // If still loading auth, wait
    if (loading) return;

    // If authenticated, check if already registered — hide if so
    if (isAuthenticated) {
      fetch('/api/summer-camp/status')
        .then((res) => res.json())
        .then((data) => {
          if (!data.registered) {
            setShowNotif(true);
          }
        })
        .catch(() => {
          // On error, show anyway
          setShowNotif(true);
        });
    } else {
      // Not authenticated — show the notification
      setShowNotif(true);
    }
  }, [isAuthenticated, loading]);

  const handleDismiss = () => {
    localStorage.setItem('camp_notif_dismissed', 'true');
    setShowNotif(false);
  };

  if (!showNotif) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-[calc(100vw-3rem)] rounded-2xl border border-yellow-500/20 bg-black/95 p-5 shadow-[0_8px_32px_rgba(250,200,37,0.2)] backdrop-blur-md hover:border-yellow-500/40 transition-all duration-300 animate-[slideUp_0.5s_ease-out]">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-xs"
        aria-label="Close notification"
      >
        ✕
      </button>

      <div className="flex items-start gap-4">
        {/* Tiny logo */}
        <div className="relative h-10 w-10 min-w-[2.5rem] rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
          <Image src="/tc-logo.svg" alt="Camp" fill className="object-contain p-1.5" />
        </div>

        <div className="flex-1 pr-4">
          <span className="inline-block rounded bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#fac825] font-mono">
            NEW COHORT
          </span>
          <h4 className="text-sm font-bold text-white mt-1.5 uppercase font-sans tracking-wide">Summer Camp 2026</h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Unlock exclusive elite mentorship, hardware labs, and full-stack building this July.
          </p>
          
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/summer-camp"
              className="rounded-lg bg-gradient-to-r from-[#fac825] to-[#d4b436] px-3.5 py-1.5 text-xs font-bold text-black uppercase tracking-wider transition hover:scale-[102%] hover:shadow-[0_0_12px_rgba(250,200,37,0.2)]"
            >
              Secure Seat
            </Link>
            <button
              onClick={handleDismiss}
              className="text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
