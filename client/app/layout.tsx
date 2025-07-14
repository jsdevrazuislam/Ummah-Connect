import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import ReactQueryProvider from "@/components/query-provider"
import SocketEvents from "@/components/sockets-events"
import { TooltipProvider } from '@/components/ui/tooltip'
import IncomingCallNotification from "@/components/incoming-call-modal";
import { RingtonePlayer } from "@/components/ringtone-player"
import CallRejectedModal from "@/components/call-rejected-modal"
import WrapperLoader from "@/components/wrapper-loader"
import { StreamEndedModal } from "@/components/live-stream-end-modal-for-viewers"
import { GlobalModal } from "@/components/post-modal"

const nato = Noto_Sans({ subsets: ["latin"], display: "swap" })

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
      <body className={nato.className} suppressHydrationWarning={true} >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <ReactQueryProvider>
              <WrapperLoader>
                <SocketEvents />
                <IncomingCallNotification />
                <RingtonePlayer />
                <CallRejectedModal />
                <StreamEndedModal />
                {children}
                <GlobalModal />
                <Toaster />
              </WrapperLoader>
            </ReactQueryProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
