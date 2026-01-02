'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function BannedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'Your account has been suspended.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="max-w-2xl w-full bg-[#0f0f0f] border-2 border-[#C9A227] rounded-lg overflow-hidden shadow-[0_8px_32px_rgba(201,162,39,0.15)]">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-b-2 border-[#C9A227] p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-[#1a1a1a] border-2 border-red-600 mb-4">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#C9A227] font-mono tracking-wider">
            ACCESS DENIED
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-mono tracking-wide uppercase">
            Account Suspended
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-[#1a1a1a] border-l-4 border-red-600 p-6 rounded-md mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                  Suspension Reason:
                </p>
                <p className="text-sm text-red-400 font-mono leading-relaxed">
                  {reason}
                </p>
              </div>
            </div>
          </div>

          {/* Terminal-style message */}
          <div className="bg-[#0a0a0a] border border-[#C9A227] rounded-md p-4 mb-6 font-mono text-sm">
            <div className="text-[#C9A227] mb-2">
              <span className="text-gray-500">$</span> status --check
            </div>
            <div className="text-red-400 ml-4">
              ✗ ACCOUNT_STATUS: <span className="font-bold">SUSPENDED</span>
            </div>
            <div className="text-gray-500 ml-4">
              ✗ ACCESS_LEVEL: <span className="text-red-400">DENIED</span>
            </div>
            <div className="text-gray-500 ml-4 mt-2">
              » Your access to Tech Club has been restricted.
            </div>
          </div>

          <p className="text-sm text-gray-400 text-center mb-6 font-mono">
            If you believe this is a mistake, please contact our support team.
          </p>

          {/* Contact button */}
          <div className="text-center">
            <a
              href="mailto:techclubdpsrpk@gmail.com"
              className="inline-flex items-center px-6 py-3 border-2 border-[#C9A227] text-sm font-mono font-bold rounded-md text-[#C9A227] bg-transparent hover:bg-[#C9A227] hover:text-black transition-all duration-300 tracking-wider"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              CONTACT SUPPORT
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0a0a0a] border-t border-[#C9A227] p-4 text-center">
          <p className="text-xs font-mono text-gray-600 tracking-wider">
            TECH CLUB | DPS RUBY PARK
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BannedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-[#C9A227] font-mono">Loading...</div>
      </div>
    }>
      <BannedContent />
    </Suspense>
  );
}