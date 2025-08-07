"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, LogOut, Mail, Undo } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cancelAccountDeletion } from "@/lib/apis/auth";
import { showError, showSuccess } from "@/lib/toast";
import { useStore } from "@/store/store";

export default function AccountDeletedPage() {
  const router = useRouter();
  const { logout, setLogin, initialLoading } = useStore();
  const { mutate, isPending } = useMutation({
    mutationFn: cancelAccountDeletion,
    onSuccess: ({ data }) => {
      setLogin(data.accessToken, data.refreshToken, data.user);
      showSuccess("Account Recover Successfully");
      initialLoading();
      router.replace("/");
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleCancelDelete = () => {
    mutate();
  };

  const handleContactSupport = () => {
    router.replace("/support?topic=account-deletion");
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
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
            disabled={isPending}
          >
            <Undo className="w-4 h-4" />
            Cancel Deletion
          </Button>

          <Button
            onClick={handleContactSupport}
            className="w-full gap-2"
            variant="secondary"
            disabled={isPending}
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </Button>

          <Button
            onClick={handleLogout}
            className="w-full gap-2"
            variant="ghost"
            disabled={isPending}
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
