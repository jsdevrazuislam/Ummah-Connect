import { Skeleton } from "@/components/ui/skeleton";

export default function LiveStreamSkeleton() {
    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="flex-1 flex flex-col">
                <div className="relative bg-muted flex-1">
                    <Skeleton className="w-full h-full rounded-none" />
                    <div className="absolute top-4 left-4">
                        <Skeleton className="h-6 w-20 rounded-md" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                        <Skeleton className="h-10 w-24 rounded-full" />
                    </div>
                </div>

                <div className="p-4 border-t border-border">
                    <Skeleton className="h-7 w-3/4 mb-4" />
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-9 w-20 ml-2 rounded-md" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-9 rounded-md" />
                            <Skeleton className="h-9 w-9 rounded-md" />
                            <Skeleton className="h-9 w-9 rounded-md" />
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </div>

            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border flex flex-col h-[400px] md:h-full">
                <div className="p-3 border-b border-border">
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex-1 p-3 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 border-t border-border">
                    <div className="flex gap-2">
                        <Skeleton className="flex-1 h-10 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}