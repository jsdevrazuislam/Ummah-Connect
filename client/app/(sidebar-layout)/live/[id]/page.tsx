import React from 'react'
import LiveStreamPage from '@/app/(sidebar-layout)/live/[id]/stream-details'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN } from '@/constants'
import { notFound } from 'next/navigation'
import { ErrorPage } from '@/components/error-page'

export async function fetchStream(streamId: string) {
  try {
    const cookie = await cookies();
    const token = cookie.get(ACCESS_TOKEN)?.value;

    if (!token) return null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/stream/details?streamId=${streamId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        error: {
          status: res.status,
          message: errorData.message || 'Failed to fetch stream data',
        }
      };
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching stream:', error);
    return {
      error: {
        status: 500,
        message: 'An unexpected error occurred',
      }
    };
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { id } = await params;
    const stream = await fetchStream(id);

    if ('error' in stream) {
      return {
        title: 'Stream Not Found | Ummah Connect',
        description: 'The requested stream could not be found',
      };
    }

    if (!stream?.data?.stream) notFound();

    const data = stream.data.stream;

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
    };
  } catch {
    return {
      title: 'Error | Ummah Connect',
      description: 'An error occurred while loading stream information',
    };
  }
}

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const result = await fetchStream(id);

  if ('error' in result) {
    return (
      <ErrorPage 
        statusCode={result.error.status}
        title="Stream Loading Error"
        message={result.error.message}
        actionText="Back to Live Streams"
        actionHref="/live"
      />
    );
  }

  if (!result?.data) {
    return (
      <ErrorPage
        statusCode={404}
        title="Stream Not Found"
        message="The requested stream could not be found"
        actionText="Back to Live Streams"
        actionHref="/live"
      />
    );
  }

  return (
    <LiveStreamPage 
      id={id} 
      stream={result.data.stream} 
      livekitUrl={result.data.livekitUrl} 
      token={result.data.token} 
    />
  );
};


export default Page