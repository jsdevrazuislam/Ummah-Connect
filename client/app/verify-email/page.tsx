import type { Metadata } from "next";

import { Suspense } from "react";

import VerifyEmailPage from "@/app/verify-email/verify-email";
import { LoadingOverlay } from "@/components/loading-overlay";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify Email to your ummah connect account",
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingOverlay loading />}>
      <VerifyEmailPage />
    </Suspense>
  );
}
