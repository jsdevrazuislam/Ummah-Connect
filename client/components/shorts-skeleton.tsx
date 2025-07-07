import { Skeleton } from "@/components/ui/skeleton"

export function ShortsSkeleton() {
  return (
    <div className="relative mx-auto max-w-[320px] h-[calc(100vh-80px)] bg-gray-900">
      <Skeleton className="absolute inset-0" />
      
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
      
      <div className="absolute bottom-4 left-4 right-16">
        <div className="flex items-center space-x-2 mb-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-3/4 mb-3" />
        <div className="flex space-x-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      
      <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-5">
        <div className="flex flex-col items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-3 w-6 mt-1" />
        </div>
        <div className="flex flex-col items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-3 w-6 mt-1" />
        </div>
        <div className="flex flex-col items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-3 w-6 mt-1" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center p-3 space-x-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  )
}