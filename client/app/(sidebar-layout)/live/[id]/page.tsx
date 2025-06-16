import React from 'react'
import LiveStreamPage from '@/app/(sidebar-layout)/live/[id]/stream-details'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN } from '@/constants'
import { notFound } from 'next/navigation'

export async function fetchStream(streamId: string) {
  const cookie = await cookies()
  const token = cookie.get(ACCESS_TOKEN)?.value

  if (!token) return null

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/stream/details?streamId=${streamId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return undefined

  return res.json()
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params
  const stream = await fetchStream(id) as LiveStreamDetailsResponse

  if (!stream) notFound()

  const data = stream?.data?.stream

  return {
    title: `${data?.title} | Live Stream by ${data?.user?.full_name}`,
    description: data?.description || 'Watch live on Ummah Connect',
    openGraph: {
      title: `${data?.title} | Live Stream`,
      description: data?.description || '',
      images: [
        {
          url: data?.thumbnail || '/live.webp',
          width: 1280,
          height: 720,
          alt: `${data?.title}`,
        },
      ],
      locale: 'en_US',
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title: data?.title,
      description: data?.description || '',
      images: [data?.thumbnail || '/live.webp'],
    },
  }
}


const Page = async ({ params }: { params: { id: string } }) => {

  const { id } = await params
  const stream = await fetchStream(id) as LiveStreamDetailsResponse
  const data = stream?.data

  if (!data) {
    return null
  }

  return (
    <LiveStreamPage id={id} stream={data?.stream} livekitUrl={data?.livekitUrl} token={data?.token} />
  )
}

export default Page