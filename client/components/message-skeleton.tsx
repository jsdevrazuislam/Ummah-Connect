import { Skeleton } from "@/components/ui/skeleton";

export function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-2 items-start">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-1 w-full">
            <div className="flex gap-2 items-center">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-2 w-16 rounded-md" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
