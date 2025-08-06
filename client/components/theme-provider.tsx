"use client";

import type { ThemeProviderProps } from "next-themes";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

import { useSocketStore } from "@/hooks/use-socket";
import { useStore } from "@/store/store";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { initializeSocket, disconnectSocket } = useSocketStore();
  const { initialLoading } = useStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      initializeSocket();
      return () => {
        disconnectSocket();
      };
    }
  }, [isHydrated]);

  useEffect(() => {
    initialLoading();
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
