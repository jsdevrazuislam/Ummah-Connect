'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { useAuthStore } from '@/store/store'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {

  const { initialLoading } = useAuthStore()
  React.useEffect(() => {
    initialLoading()
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
