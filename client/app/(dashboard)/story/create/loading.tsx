import { ArrowLeft, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export default function StoryPageSkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button className="rounded-full p-2 hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </button>
        <button className="rounded-full p-2 hover:bg-accent transition-colors">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-center text-2xl font-bold">
            <Skeleton className="h-8 w-48 mx-auto" />
          </h2>

          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted">
                <Skeleton className="h-full w-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </div>
              <div className="w-full space-y-2">
                <Skeleton className="h-5 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Skeleton className="h-32 w-32 rounded-full bg-white/20" />
              </div>
              <div className="w-full space-y-2">
                <Skeleton className="h-5 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
