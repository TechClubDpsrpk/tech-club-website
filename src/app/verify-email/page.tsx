// app/verify-email/page.tsx
import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
