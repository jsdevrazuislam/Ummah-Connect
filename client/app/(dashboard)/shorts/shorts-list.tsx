'use client'

import { useRef, useState } from 'react'
import {
    ArrowUp,
    ArrowDown,
    VideoOff
} from 'lucide-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { get_shorts } from '@/lib/apis/stream'
import { ErrorMessage } from '@/components/api-error'
import ShortLoading from '@/app/(dashboard)/shorts/loading'
import ShortVideo from '@/components/short-video'




export default function ShortsListView() {
    const [currentShortIndex, setCurrentShortIndex] = useState(0);
    const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');
    const shortContainerRef = useRef<HTMLDivElement>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<ShortsResponse>({
        queryKey: ['get_shorts'],
        queryFn: ({ pageParam = 1 }) => get_shorts({ page: Number(pageParam) }),
        getNextPageParam: (lastPage) => {
            const nextPage = (lastPage?.data?.currentPage ?? 0) + 1;
            return nextPage <= (lastPage?.data?.totalPages ?? 1) ? nextPage : undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    });


    const shorts = data?.pages.flatMap(page => page?.data?.shorts) ?? [];
    const currentShort = shorts[currentShortIndex];

    const loadMorePosts = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };




    const navigateShort = (direction: 'next' | 'prev') => {
        setAnimationDirection(direction);
        if (direction === 'next') {
            if (currentShortIndex < shorts.length - 1) {
                setCurrentShortIndex(prevIndex => prevIndex + 1);
            } else if (hasNextPage) {
                loadMorePosts();
            }
        } else if (direction === 'prev') {
            if (currentShortIndex > 0) {
                setCurrentShortIndex(prevIndex => prevIndex - 1);
            }
        }
    };

    if (isLoading) {
        return (
            <ShortLoading />
        );
    }

    if (isError) {
        return <div className="flex justify-center items-center mt-10">
            <ErrorMessage type='network' />
        </div>
    }

    if (!shorts || shorts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-96px)] text-gray-400">
                <VideoOff className="h-10 w-10 mb-3" />
                <p className="text-lg font-semibold">No Shorts found</p>
                <p className="text-sm mt-1">Please try again later or upload a video.</p>
            </div>
        );
    }


    return (
        <>
            <ShortVideo
                currentShort={currentShort}
                currentShortIndex={currentShortIndex}
                navigateShort={navigateShort}
                animationDirection={animationDirection}
            />

            <div className="absolute top-[30%] right-[5%] flex flex-col gap-4">
                <button
                    onClick={() => navigateShort('prev')}
                    aria-label="Previous short"
                >
                    <div className="bg-white/10 rounded-full p-2">
                        <ArrowUp />
                    </div>
                </button>
                <button
                    onClick={() => navigateShort('next')}
                    aria-label="Next short"
                >
                    <div className="bg-white/10 rounded-full p-2">
                        <ArrowDown />
                    </div>
                </button>
            </div>
        </>
    )
}