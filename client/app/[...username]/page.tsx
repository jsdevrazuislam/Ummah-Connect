import type { Metadata } from "next";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import MainLayout from "@/app/(dashboard)/layout";
import ProfilePage from "@/app/[...username]/user-details";
import { ACCESS_TOKEN } from "@/constants";

type Props = {
  params: {
    username: string;
  };
};

const blockUsername = [".well-known", "appspecific", "com.chrome.devtools.json"];
async function fetchUser(username: string) {
  const cookie = await cookies();
  const token = cookie.get(ACCESS_TOKEN)?.value;

  if (
    !username
    || blockUsername.some(blocked => username.includes(blocked))
  ) {
    return;
  }

  if (!token)
    return null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/${username}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok)
    return undefined;
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await fetchUser(username) as ProfileUser;
  const userData = user?.data?.user;

  if (!user) {
    notFound();
  }

  return {
    title: `${userData.fullName} (@${userData.username}) | Ummah Connect`,
    description: userData.bio,
    openGraph: {
      title: `${userData.fullName} (@${userData.username})`,
      description: userData.bio,
      images: [
        {
          url: userData.avatar ?? "",
          width: 800,
          height: 600,
          alt: `${userData.fullName}'s profile picture`,
        },
      ],
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${userData.fullName} (@${userData.username})`,
      description: userData.bio,
      images: [userData.avatar ?? ""],
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await fetchUser(username) as ProfileUser;
  const userData = user?.data;

  if (!user) {
    notFound();
  }

  return (
    <MainLayout>
      <ProfilePage username={username} user={userData?.user} />
    </MainLayout>
  );
}
