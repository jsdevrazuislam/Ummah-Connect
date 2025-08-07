import type { Metadata } from "next";
import type React from "react";

// eslint-disable-next-line camelcase
import { Noto_Sans } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";
import CallRejectedModal from "@/components/call-rejected-modal";
import IncomingCallNotification from "@/components/incoming-call-modal";
import { StreamEndedModal } from "@/components/live-stream-end-modal-for-viewers";
import { GlobalModal } from "@/components/post-modal";
import { PrayerTimeNotifications } from "@/components/prayer-notification-modal";
import ReactQueryProvider from "@/components/query-provider";
import { RingtonePlayer } from "@/components/ringtone-player";
import SocketEvents from "@/components/sockets-events";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import WrapperLoader from "@/components/wrapper-loader";

const nato = Noto_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Ummah Connect",
  description: "A social media platform for the Muslim Ummah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={nato.className} suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <ReactQueryProvider>
              <WrapperLoader>
                <SocketEvents />
                <IncomingCallNotification />
                <PrayerTimeNotifications />
                <RingtonePlayer />
                <CallRejectedModal />
                <StreamEndedModal />
                {children}
                <GlobalModal />
                <Toaster richColors />
              </WrapperLoader>
            </ReactQueryProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
