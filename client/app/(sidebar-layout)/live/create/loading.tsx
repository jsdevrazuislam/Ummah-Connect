import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function GoLiveSkeleton() {
    return (
        <>
            <div className="mb-6 mt-6">
                <Skeleton className="h-5 w-28" />
            </div>

            <Skeleton className="h-8 w-32 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-2/3 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-24 w-full" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32 mb-4" />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                        <Skeleton className="h-6 w-11 rounded-full" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-56" />
                                        </div>
                                        <Skeleton className="h-6 w-11 rounded-full" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-36" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                        <Skeleton className="h-6 w-11 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="aspect-video w-full rounded-md mb-4" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                            <div className="flex items-center gap-2 mt-2">
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-1/3" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-4 w-full mt-2" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}