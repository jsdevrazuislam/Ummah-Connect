"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function PostSkeleton() {
  return (
    <div className="border-b border-border p-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[75%]" />
          </div>

          {Math.random() > 0.5 && (
            <div className="mt-3">
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
