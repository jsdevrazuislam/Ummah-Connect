"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, VideoOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import ShortLoading from "@/app/(dashboard)/shorts/loading";
import { ErrorMessage } from "@/components/api-error";
import ShortVideo from "@/components/short-video";
import { Button } from "@/components/ui/button";
import { UploadShortModal } from "@/components/upload-shorts";
import { getShorts } from "@/lib/apis/stream";

export default function ShortPage({ id }: { id: number }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isValidId, setIsValidId] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<ShortsResponse>({
    queryKey: ["get_shorts"],
    queryFn: ({ pageParam = 1 }) => getShorts({ page: Number(pageParam) }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data)
        return undefined;
      const nextPage = lastPage.data.currentPage + 1;
      return nextPage <= lastPage.data.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  const shorts = useMemo(
    () => data?.pages.flatMap(page => page?.data?.shorts ?? []) ?? [],
    [data],
  );

  useLayoutEffect(() => {
    if (shorts.length > 0) {
      const initialIndex = shorts.findIndex(short => short?.id === id);

      if (initialIndex === -1) {
        setIsValidId(false);
        return;
      }

      setIsValidId(true);
      setActiveIndex(initialIndex);

      const container = containerRef.current;
      if (container) {
        container.scrollTo({
          top: initialIndex * container.clientHeight,
          behavior: "auto",
        });
      }
    }
  }, [shorts, id]);

  const scrollToVideo = (direction: "up" | "down") => {
    const container = containerRef.current;
    if (!container)
      return;

    const currentIndex = activeIndex;
    let newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    newIndex = Math.max(0, Math.min(newIndex, shorts.length - 1));

    if (newIndex === shorts.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }

    const targetScrollTop = newIndex * container.clientHeight;
    container.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });

    const newShort = shorts[newIndex];
    if (newIndex !== currentIndex && newShort?.id) {
      router.replace(`/shorts/${newShort.id}`, { scroll: false });
    }
  };

  const loadMorePosts = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container)
      return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const index = Math.round(scrollTop / itemHeight);

      const newIndex = Math.max(0, Math.min(index, shorts.length - 1));
      setActiveIndex(newIndex);

      const currentShort = shorts[newIndex];
      if (newIndex !== activeIndex && currentShort?.id) {
        router.replace(`/shorts/${currentShort.id}`, { scroll: false });
      }

      if (index >= shorts.length - 3 && hasNextPage && !isFetchingNextPage) {
        loadMorePosts();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [shorts, hasNextPage, isFetchingNextPage, activeIndex]);

  if (!isValidId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-96px)] text-gray-400">
        <VideoOff className="h-10 w-10 mb-3" />
        <p className="text-lg font-semibold">Short not found</p>
        <p className="text-sm mt-1">The requested short video doesn't exist.</p>
        <Button
          onClick={() => router.push("/shorts")}
          className="mt-4"
        >
          Browse Shorts
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <ShortLoading />;
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center mt-10">
        <ErrorMessage type="network" />
      </div>
    );
  }

  if (!shorts || shorts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-96px)] text-gray-400">
        <VideoOff className="h-10 w-10 mb-3" />
        <p className="text-lg font-semibold">No Shorts found</p>
        <p className="text-sm mt-1">Please try again later or upload a video.</p>
        <UploadShortModal />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-130px)] lg:h-[calc(100dvh-70px)] bg-background">
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
            disabled={activeIndex === shorts.length - 1}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        <div
          ref={containerRef}
          className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {shorts.map((short, index) => (
            short
              ? (
                  <div
                    key={short.id}
                    className="h-screen w-full snap-start snap-always flex items-center justify-center p-4"
                  >
                    <ShortVideo
                      currentShort={short}
                      isActive={index === activeIndex}
                    />
                  </div>

                )
              : null
          ))}
          {isFetchingNextPage && (
            <div className="h-screen w-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          )}
        </div>
      </main>
      <UploadShortModal />
    </div>
  );
}
