import LeftSidebarLoading, { RightSidebarLoading } from "@/components/loading-skeletons/home-page-loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePageSkeleton() {
  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <LeftSidebarLoading />

        <div className="flex-1 space-y-4">
          {[...Array.from({ length: 5 })].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-4/5 mb-6" />
              <Skeleton className="h-64 w-full rounded-lg mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>

        <RightSidebarLoading />
      </div>
    </div>
  );
}
