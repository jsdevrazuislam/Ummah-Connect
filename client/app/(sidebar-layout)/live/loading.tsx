import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LiveStreamCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <Skeleton className="w-full aspect-video" />
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
        <div className="p-3">
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-20 mt-1 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LivePageSkeleton() {
  return (
    <>
      <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-24 ml-12 lg:ml-0" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="relative mb-4">
          <Skeleton className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 rounded-full" />
          <Skeleton className="w-full h-9 pl-10" />
        </div>
        <div className="mt-4">
          <Skeleton className="w-full h-10 rounded-md" />
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <LiveStreamCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
