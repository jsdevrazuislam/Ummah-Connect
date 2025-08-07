"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { LoginFormData } from "@/validation/auth.validation";

import { TwoFactorAuthModal } from "@/components/2fa-auth-model";
import { LoadingOverlay } from "@/components/loading-overlay";
import { RecoveryLogin } from "@/components/recover-login";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/apis/auth";
import { showError, showSuccess } from "@/lib/toast";
import { useStore } from "@/store/store";
import { loginSchema } from "@/validation/auth.validation";

export default function LoginPage() {
  const { setLogin, initialLoading } = useStore();
  const [show2FAModel, setShow2FAModal] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const router = useRouter();
  const [payload, setPayload] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [showRecoveryModel, setShowRecoveryModel] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ data }) => {
      if (data.user.isDeleteAccount) {
        setLogin(data.accessToken, data.refreshToken, data.user);
        return router.replace("/account-deleted");
      }
      if (!data?.user) {
        setShow2FAModal(true);
      }
      else {
        setLogin(data.accessToken, data.refreshToken, data.user);
        showSuccess("Login successfully");
        initialLoading();
        router.replace("/");
      }
    },
    onError: (error) => {
      showError(error.message);
    },
  });
  const onSubmit = (data: LoginFormData) => {
    const payload = {
      ...data,
    };
    mutate(payload);
    setPayload(payload);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoadingOverlay loading={isPending} />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Ummah Connect</h1>
          <p className="text-muted-foreground mt-2">Connect with the global Muslim community</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="my-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="my-4">
                <Input placeholder="email or username" id="email" type="text" {...register("emailOrUsername")} error={errors.emailOrUsername?.message} />
              </div>
              <div className="my-4">
                <Input id="password" placeholder="password" type="password" {...register("password")} error={errors.password?.message} />
              </div>
              <div className="flex items-end justify-end mb-2">
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="text-s font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </div>
              <Button disabled={isPending} type="submit" className="w-full mt-4">Login</Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col my-4">
            <div className="text-center text-sm">
              Don't have an account?
              {" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      {show2FAModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <TwoFactorAuthModal
            onCancel={() => setShow2FAModal(false)}
            onVerify={(code) => {
              mutate({ ...payload, token: code });
            }}
            setShowRecoveryModel={setShowRecoveryModel}
          />
        </div>
      )}
      <RecoveryLogin setShowRecoveryModel={setShowRecoveryModel} showRecoveryModel={showRecoveryModel} />
    </div>
  );
}
