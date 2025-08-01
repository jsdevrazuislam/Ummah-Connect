import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PeopleLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <Skeleton className="h-12 w-80" />
          </div>
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border p-6 mb-8">
          <div className="space-y-4">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* User Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="border-0 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900"
            >
              <CardContent className="p-0">
                {/* Header gradient */}
                <Skeleton className="h-20 w-full rounded-t-lg" />

                <div className="px-6 pb-6 -mt-10 relative">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                  </div>

                  {/* User Info */}
                  <div className="text-center mb-4 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-24 mx-auto" />
                    <Skeleton className="h-4 w-28 mx-auto" />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>

                  {/* Location and Age */}
                  <div className="flex justify-center gap-4 mb-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>

                  {/* Stats */}
                  <div className="flex justify-center gap-6 mb-4">
                    <div className="text-center space-y-1">
                      <Skeleton className="h-5 w-12 mx-auto" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                    <div className="text-center space-y-1">
                      <Skeleton className="h-5 w-12 mx-auto" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                    <div className="text-center space-y-1">
                      <Skeleton className="h-5 w-12 mx-auto" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="flex justify-center gap-1 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-18" />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between mt-8">
          <Skeleton className="h-5 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-9" />
              ))}
            </div>
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
