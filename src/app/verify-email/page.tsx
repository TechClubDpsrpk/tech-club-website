import { Suspense } from 'react';
import { VerifyEmailClient } from './verify-email-client';

function VerifyEmailSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-block rounded-full bg-gray-700/50 p-4">
            <div className="h-8 w-8 rounded-full bg-gray-600 animate-pulse"></div>
          </div>
          <div className="mb-2 h-8 w-40 rounded bg-gray-700 animate-pulse"></div>
          <div className="h-4 w-48 rounded bg-gray-700 animate-pulse"></div>
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
