import React from 'react'
import PostDetailsPage from '@/app/share/[id]/post-details'
import { SocialMediaLayout } from '@/components/layouts/main-layout'
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN } from '@/constants';

type Props = {
    params: {
        id: string;
    };
};

interface PostDetailsResponse {
  statusCode: number;
  data: Data;
  message: string;
  success: boolean;
}
interface Data {
  post: PostsEntity;
}

async function getPost(id: string): Promise<PostDetailsResponse | null> {
    const cookie = await cookies();
    const token = cookie.get(ACCESS_TOKEN)?.value;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/post/post-details/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        })
        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params
    const data = await getPost(id)
    const post =  data?.data?.post

    if (!post) return {}

    return {
        title: 'Post | Social Media',
        description: post.content?.slice(0, 150) || 'View shared post',
        openGraph: {
            title: 'Post | Social Media',
            description: post.content,
            images: [
                {
                    url: post.media || '/default-og.png',
                    width: 800,
                    height: 600,
                },
            ],
        },
    }
}



const Page = async ({ params }: Props) => {

    const { id } = await params
    const data = await getPost(id)
    const post =  data?.data?.post

    if (!post) return notFound()


    return (
        <SocialMediaLayout>
            <PostDetailsPage post={post} />
        </SocialMediaLayout>
    )
}

export default Page