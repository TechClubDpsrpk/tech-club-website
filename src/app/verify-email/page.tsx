import { Suspense } from 'react';
import { VerifyEmailClient } from './verify-email-client';

function VerifyEmailSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-[0_0_50px_-12px_rgba(201,162,39,0.25)] backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-block rounded-full bg-[#C9A227]/10 p-4">
            <div className="h-8 w-8 rounded-full bg-[#C9A227]/20 animate-pulse"></div>
          </div>
          <div className="mb-2 h-8 w-40 rounded bg-gray-800 animate-pulse"></div>
          <div className="h-4 w-48 rounded bg-gray-800 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
