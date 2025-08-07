import type { Metadata } from "next";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import meta from "@/configs/meta";

export const metadata: Metadata = {
  title: `Terms of Service - ${meta.APP_NAME}`,
  description: `Read the terms and conditions of using ${meta.APP_NAME}`,
};

export default function TermsPage() {
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
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <section className="space-y-4">
        <p>
          Welcome to
          {" "}
          <strong>{meta.APP_NAME}</strong>
          ! These Terms of Service govern your use of our platform. By using our service, you agree to abide by the terms below.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. User Conduct</h2>
        <p>
          You agree not to post or share any content that is illegal, harmful, abusive, harassing, defamatory, or otherwise objectionable. We reserve the right to suspend or terminate accounts that violate these terms.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. Privacy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your data.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Content Ownership</h2>
        <p>
          You retain ownership of the content you create. However, by posting on the platform, you grant us a non-exclusive, royalty-free license to use and display that content.
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the platform after changes indicates your acceptance.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Termination</h2>
        <p>
          We reserve the right to suspend or delete your account at our discretion if you violate these terms or for any other reason.
        </p>

        <p className="mt-10 text-muted-foreground">
          Last updated: July 30, 2025
        </p>
      </section>
    </div>
  );
}
