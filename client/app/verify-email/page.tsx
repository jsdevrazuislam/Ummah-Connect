import { Metadata } from "next"
import VerifyEmailPage from "@/app/verify-email/verify-email"
import { Suspense } from "react"
import { LoadingOverlay } from "@/components/loading-overlay"

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify Email to your ummah connect account"
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingOverlay loading />}>
      <VerifyEmailPage />
    </Suspense>
  )
}
