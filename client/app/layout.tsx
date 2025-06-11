import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { AIAssistant } from "@/components/ai-assistant"
import ReactQueryProvider from "@/components/query-provider"
import SocketEvents from "@/components/sockets-events"
import { TooltipProvider } from '@/components/ui/tooltip'
import IncomingCallNotification from "@/components/incoming-call-modal";
import { CallTimeoutModal } from "@/components/call-timeout-modal"
import { RingtonePlayer } from "@/components/ringtone-player"
import CallRejectedModal from "@/components/call-rejected-modal"

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
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true} >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <ReactQueryProvider>
              <SocketEvents />
              <IncomingCallNotification />
              <CallTimeoutModal />
              <RingtonePlayer />
              <CallRejectedModal />
              {children}
              {/* <AIAssistant /> */}
              <Toaster />
            </ReactQueryProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
