import type { Metadata } from "next";

import React from "react";

import LoginPage from "@/app/login/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your ummah connect account",
};

function Page() {
  return (
    <LoginPage />
  );
}

export default Page;
