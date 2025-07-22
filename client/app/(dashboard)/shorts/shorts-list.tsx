"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, VideoOff } from "lucide-react"
import { useInfiniteQuery } from '@tanstack/react-query'
import { get_shorts } from '@/lib/apis/stream'
import { ErrorMessage } from '@/components/api-error'
import ShortLoading from '@/app/(dashboard)/shorts/loading'
import ShortVideo from '@/components/short-video'

export default function ShortsPage() {
    const [activeIndex, setActiveIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
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


    const scrollToVideo = (direction: "up" | "down") => {
        const container = containerRef.current
        if (!container) return

        const currentIndex = activeIndex
        let newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

        if (newIndex < 0) newIndex = 0
        if (newIndex >= shorts.length) newIndex = shorts.length - 1

        const targetScrollTop = newIndex * container.clientHeight
        container.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
        })
    }



    const loadMorePosts = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const itemHeight = container.clientHeight;
            const index = Math.round(scrollTop / itemHeight);
            setActiveIndex(Math.max(0, Math.min(index, shorts.length - 1)));

            if (index >= shorts.length - 3 && hasNextPage && !isFetchingNextPage) {
                loadMorePosts();
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [shorts.length, hasNextPage, isFetchingNextPage]);

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
        <div className="flex min-h-screen bg-background">
            <main className="flex-1 relative">
                <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 hidden md:flex flex-col gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white/10 w-10 h-10 shadow-lg"
                        onClick={() => scrollToVideo("up")}
                        disabled={activeIndex === 0}
                    >
                        <ChevronUp className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white/10 w-10 h-10 shadow-lg"
                        onClick={() => scrollToVideo("down")}
                        disabled={activeIndex === shorts?.length - 1}
                    >
                        <ChevronDown className="h-5 w-5" />
                    </Button>
                </div>

                <div
                    ref={containerRef}
                    className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {shorts?.map((short, index) => (
                        <div key={short?.id} className="h-screen w-full snap-start flex items-center justify-center p-4">
                            <ShortVideo currentShort={short} isActive={index === activeIndex} />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}