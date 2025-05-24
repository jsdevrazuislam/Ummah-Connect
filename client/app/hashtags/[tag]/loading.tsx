import { Skeleton } from "@/components/ui/skeleton"
import { PostSkeleton } from "@/components/post-skeleton"

export default function HashtagLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-4 space-y-4 border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
        <Skeleton className="h-4 w-96" />
        <div className="flex gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
        <div className="hidden lg:block w-80 p-4">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}
