import { Skeleton } from "@/components/ui/skeleton"

export default function ConversationSkeleton() {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex gap-3 items-center">
        <div className="relative">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
