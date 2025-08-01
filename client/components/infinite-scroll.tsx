"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type InfiniteScrollProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  children: React.ReactNode;
  className?: string;
};

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
  children,
  className,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [isLoadingInternal, setIsLoadingInternal] = useState(false);

  const debouncedLoadMore = useCallback(() => {
    if (!isLoadingInternal && hasMore && !isLoading) {
      setIsLoadingInternal(true);
      onLoadMore();
      const timer = setTimeout(() => {
        setIsLoadingInternal(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasMore, isLoading, onLoadMore]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting) {
        debouncedLoadMore();
      }
    },
    [debouncedLoadMore],
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element)
      return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: `${threshold}px`,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  return (
    <>
      {children}
      <div ref={loadingRef} className={cn("h-4", className)} />
    </>
  );
}
