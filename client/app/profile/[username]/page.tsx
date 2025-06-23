import { Metadata } from 'next';
import ProfilePage from '@/app/profile/[username]/user-details';
import { notFound } from 'next/navigation'
import { cookies } from "next/headers";
import { ACCESS_TOKEN } from '@/constants';
import MainLayout from '@/app/(dashboard)/layout';


type Props = {
  params: {
    username: string;
  };
};

async function fetchUser(username: string) {
  const cookie = await cookies();
  const token = cookie.get(ACCESS_TOKEN)?.value;

  if (!token) return null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/${username}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })
  if (!res.ok) return undefined
  return res.json()
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = await fetchUser(username) as ProfileUser
  const userData = user?.data

  if (!user) {
    notFound()
  }

  return {
    title: `${userData.full_name} (@${userData.username}) | Your App Name`,
    description: userData.bio,
    openGraph: {
      title: `${userData.full_name} (@${userData.username})`,
      description: userData.bio,
      images: [
        {
          url: userData.avatar ?? '',
          width: 800,
          height: 600,
          alt: `${userData.full_name}'s profile picture`,
        },
      ],
      locale: 'en_US',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${userData.full_name} (@${userData.username})`,
      description: userData.bio,
      images: [userData.avatar ?? ''],
    },
  };
}


export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const user = await fetchUser(username) as ProfileUser
  const userData = user?.data

  return (
    <MainLayout>
      <ProfilePage username={username} user={userData} />
    </MainLayout>
  )
}
