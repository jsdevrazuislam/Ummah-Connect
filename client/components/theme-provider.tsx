"use client";

import type { ThemeProviderProps } from "next-themes";

import {
  ThemeProvider as NextThemesProvider,

} from "next-themes";
import * as React from "react";

import { useSocketStore } from "@/hooks/use-socket";
import { useStore } from "@/store/store";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { initializeSocket, disconnectSocket } = useSocketStore();
  const { initialLoading } = useStore();

  React.useEffect(() => {
    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, []); ;

  React.useEffect(() => {
    initialLoading();
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
