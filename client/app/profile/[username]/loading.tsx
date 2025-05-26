"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <Skeleton className="h-48 md:h-64 w-full" />

        <div className="absolute -bottom-16 left-6">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
        </div>
      </div>

      <div className="px-6 pt-20 pb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-md" /> 
              <Skeleton className="h-4 w-3/4 max-w-sm" /> 
            </div>
            <div className="flex gap-6 pt-2">
              <div className="flex gap-1">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-10" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" /> 
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-16" /> 
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" /> 
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  {i % 3 === 0 && <Skeleton className="h-48 w-full rounded-md" />}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-4">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
