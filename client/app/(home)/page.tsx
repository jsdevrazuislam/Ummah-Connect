import type { Metadata } from "next";

import { AIPrayerReminder } from "@/components/ai-prayer-reminder";
import { SocialMediaLayout } from "@/components/layouts/main-layout";
import { MainFeed } from "@/components/main-feed";
import { StorySection } from "@/components/story-section";
import meta from "@/configs/meta";

export const metadata: Metadata = {
  title: `Home | ${meta.APP_NAME}`,
  description: `Stay updated with the latest posts from people you follow and explore trending content on ${meta.APP_NAME} — the modern social feed built just for you.`,
  keywords: [
    "social media",
    "feed",
    "latest posts",
    "followed users",
    "trending posts",
    "discover content",
    meta.APP_NAME,
  ],
  authors: [{ name: `${meta.APP_NAME} Team`, url: meta.WEBSITE }],
  creator: meta.APP_NAME,
  publisher: meta.APP_NAME,
  metadataBase: new URL(meta.WEBSITE ?? ""),
  openGraph: {
    title: `Home | ${meta.APP_NAME}`,
    description: `Join ${meta.APP_NAME} and never miss a moment. Discover trending posts and updates from your favorite creators.`,
    url: meta.WEBSITE,
    siteName: meta.APP_NAME,
    // images: [
    //   {
    //     url: "/og/home.png",
    //     width: 1200,
    //     height: 630,
    //     alt: `${meta.APP_NAME} Feed Screenshot`,
    //   },
    // ],
    type: "website",
  },
  // twitter: {
  //   card: "summary_large_image",
  //   title: `Home | ${meta.APP_NAME}`,
  //   description: `Catch up on your feed, follow people you care about, and explore new content — only on ${meta.APP_NAME}.`,
  //   images: ["/og/home.png"],
  //   site: "@yourapp",
  //   creator: "@yourapp",
  // },
  // icons: {
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon-16x16.png",
  //   apple: "/apple-touch-icon.png",
  // },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function Home() {
  return (
    <SocialMediaLayout>
      <StorySection />
      <div className="p-4 md:hidden">
        <AIPrayerReminder />
      </div>
      <MainFeed />
    </SocialMediaLayout>
  );
}
