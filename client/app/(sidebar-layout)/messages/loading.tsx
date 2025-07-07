import { Skeleton } from "@/components/ui/skeleton"

export default function ConversationLoadingSkeleton() {
  return (
    <div className="flex h-[calc(100vh-64px)] border-t">
      <div className="w-full md:w-80 lg:w-96 border-r p-4 overflow-y-auto">
        <div className="mb-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:flex flex-1 flex-col">
        <div className="border-b p-4 flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="flex items-start space-x-2 max-w-xs">
            <Skeleton className="h-8 w-8 rounded-full mt-1" />
            <div>
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-16 w-64 rounded-lg rounded-tl-none" />
            </div>
          </div>

          <div className="flex justify-end">
            <div className="max-w-xs">
              <Skeleton className="h-16 w-64 rounded-lg rounded-tr-none" />
            </div>
          </div>

          <div className="flex items-start space-x-2 max-w-xs">
            <Skeleton className="h-8 w-8 rounded-full mt-1" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-72 rounded-lg rounded-tl-none" />
              <Skeleton className="h-12 w-56 rounded-lg rounded-tl-none" />
            </div>
          </div>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      <div className="md:hidden flex-1 flex items-center justify-center bg-muted/50">
        <div className="text-center p-6">
          <Skeleton className="h-10 w-10 mx-auto rounded-full mb-4" />
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  )
}