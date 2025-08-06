import type { Metadata } from "next";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import meta from "@/configs/meta";

export const metadata: Metadata = {
  title: `Privacy Policy - ${meta.APP_NAME}`,
  description: `Understand how ${meta.APP_NAME} collects, uses, and protects your data.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl px-4 py-10 mx-auto text-sm md:text-base text-foreground">
      <Link href="/">
        <Button className="flex items-center" variant="ghost">
          {" "}
          <ChevronLeft className="w-5 h-5" />
          {" "}
          Go Back
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <section className="space-y-4">
        <p>
          Your privacy is important to us. This Privacy Policy explains how
          {" "}
          <strong>{meta.APP_NAME}</strong>
          {" "}
          collects, uses, and protects your personal information.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
        <p>
          We collect personal data such as your name, email address, profile information, and usage behavior when you use our services.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. How We Use Your Information</h2>
        <p>
          We use your data to improve the platform, personalize your experience, communicate with you, and ensure community safety.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Data Sharing</h2>
        <p>
          We do not sell your personal information. We may share data with trusted third-party partners to provide services (e.g., analytics, cloud storage).
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Cookies & Tracking</h2>
        <p>
          We use cookies and similar technologies to analyze trends, administer the platform, and track user movements across the app.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Data Security</h2>
        <p>
          We implement strong security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-xl font-semibold mt-6">6. Your Rights</h2>
        <p>
          You have the right to access, update, or delete your data. Please contact us if you wish to exercise any of these rights.
        </p>

        <p className="mt-10 text-muted-foreground">Last updated: July 30, 2025</p>
      </section>
    </div>
  );
}
