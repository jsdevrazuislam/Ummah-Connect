"use client"

import type React from "react"

import { useEffect, useRef, useCallback } from "react"

interface InfiniteScrollProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
  children: React.ReactNode
}

export function InfiniteScroll({ hasMore, isLoading, onLoadMore, threshold = 100, children }: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore()
      }
    },
    [hasMore, isLoading, onLoadMore],
  )

  useEffect(() => {
    const element = loadingRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: `${threshold}px`,
    })

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver, threshold])

  return (
    <>
      {children}
      <div ref={loadingRef} className="h-4" />
    </>
  )
}
