import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiveStreamCardSkeleton() {
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
