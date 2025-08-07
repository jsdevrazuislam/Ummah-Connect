import type React from "react";

import { IslamicQuote } from "@/components/islamic-quote";
import { PrayerTimesWidget } from "@/components/prayer-times-widget";

type RightSidebarProps = {
  children?: React.ReactNode;
};

export default function RightSidebar({ children }: RightSidebarProps) {
  return (
    <div className="hidden lg:block space-y-6 sticky top-0 h-screen overflow-y-auto">
      {children}
      <PrayerTimesWidget />
      <IslamicQuote />
    </div>
  );
}
