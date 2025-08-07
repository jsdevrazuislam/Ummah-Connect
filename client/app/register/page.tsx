import type { Metadata } from "next";

import SignupForm from "@/app/register/signup-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Register to your ummah connect account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Ummah Connect</h1>
          <p className="text-muted-foreground mt-2">Join the global Muslim community</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
