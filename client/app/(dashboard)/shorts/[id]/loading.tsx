import { Skeleton } from "@/components/ui/skeleton";

export default function ShortsFeedSkeleton() {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex space-x-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {[...Array.from({ length: 8 })].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      <div className="space-y-1">
        {[...Array.from({ length: 5 })].map((_, i) => (
          <div key={i} className="relative h-[70vh] w-full bg-gray-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-none" />
            </div>

            <div className="absolute bottom-4 left-4 right-16">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            <div className="absolute right-4 bottom-20 space-y-5">
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
          </div>
        ))}
      </div>
    </div>
  );
}
