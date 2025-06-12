'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useAuthStore } from '@/store/store'
import { useSocketStore } from '@/hooks/use-socket';


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {

  const { initializeSocket, disconnectSocket } = useSocketStore();
  const { initialLoading } = useAuthStore()


  React.useEffect(() => {
    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, []);;

  React.useEffect(() => {
    initialLoading()
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
