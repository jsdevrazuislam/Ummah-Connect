import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { AIAssistant } from "@/components/ai-assistant"
import ReactQueryProvider from "@/components/query-provider"
import SocketEvents from "@/components/sockets-events"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ummah Connect",
  description: "A social media platform for the Muslim Ummah",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ReactQueryProvider>
            <SocketEvents />
            {children}
            {/* <AIAssistant /> */}
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
