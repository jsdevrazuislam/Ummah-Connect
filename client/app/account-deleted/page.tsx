// app/account-deleted/page.tsx
"use client";

import { AlertTriangle, LogOut, Mail, Undo } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function AccountDeletedPage() {
  const router = useRouter();

  const handleCancelDelete = () => {
    // call cancel deletion API here
    router.push("/home");
  };

  const handleContactSupport = () => {
    router.push("/support?topic=account-deletion");
  };

  const handleLogout = () => {
    // call logout API here
    router.push("/login");
  };

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center justify-center bg-background text-foreground">
      <div className="max-w-md w-full border border-border rounded-2xl shadow-lg p-8 bg-card">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
          <h1 className="text-2xl font-bold">Your account is marked for deletion</h1>
          <p className="text-muted-foreground text-sm">
            This account is scheduled for deletion. You can still cancel this request within the allowed grace period.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            onClick={handleCancelDelete}
            className="w-full gap-2"
            variant="default"
          >
            <Undo className="w-4 h-4" />
            Cancel Deletion
          </Button>

          <Button
            onClick={handleContactSupport}
            className="w-full gap-2"
            variant="secondary"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </Button>

          <Button
            onClick={handleLogout}
            className="w-full gap-2"
            variant="ghost"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
