import { Skeleton } from "@/components/ui/skeleton";

export default function LeftSidebarLoading() {
  return (
    <div className="w-full md:w-64 space-y-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center mb-4">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array.from({ length: 4 })].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-6 w-full mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center mb-4">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          {[...Array.from({ length: 3 })].map((_, i) => (
            <div key={i} className="flex justify-between items-center p-2">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-3" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="text-center">
            <Skeleton className="h-4 w-24 mx-auto mb-1" />
            <Skeleton className="h-3 w-40 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RightSidebarLoading() {
  return (
    <div className="w-full md:w-72 space-y-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center mb-4">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map(prayer => (
            <div key={prayer} className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
