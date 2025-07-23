"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Trash } from "lucide-react"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteNotification, getNotifications } from "@/lib/apis/notification"
import { ErrorMessage } from "@/components/api-error"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from 'date-fns';
import {
    getNotificationColorClasses,
    getNotificationIcon,
    getNotificationTitle
} from "@/lib/notification";
import { InfiniteScroll } from "@/components/infinite-scroll"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect } from "react"
import { useAuthStore } from "@/store/store"
import { cn } from "@/lib/utils"


export default function NotificationsPage() {

    const queryClient = useQueryClient()
    const { setTotalUnread } = useAuthStore()
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<NotificationResponse>({
        queryKey: ['getNotifications'],
        queryFn: ({ pageParam = 1 }) => getNotifications({ page: Number(pageParam), limit: 10 }),
        getNextPageParam: (lastPage) => {
            const nextPage = (lastPage?.data?.page ?? 0) + 1;
            return nextPage <= (lastPage?.data?.total ?? 1) ? nextPage : undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5
    });

    const notifications = data?.pages.flatMap(page => page?.data?.notifications) ?? [];

    const loadMorePosts = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const { mutate, isPending } = useMutation({
        mutationFn: deleteNotification,
        onSuccess: (_data, deletedId) => {
            queryClient.setQueryData(['getNotifications'], (oldData: QueryOldNotificationDataPayload) => {
                const updatedPages = oldData?.pages?.map((page) => {
                    const updatedNotifications = page?.data?.notifications?.filter(
                        (notif) => notif.id !== deletedId
                    )

                    return {
                        ...page,
                        data: {
                            ...page.data,
                            notifications: updatedNotifications,
                        },
                    }
                })

                return {
                    ...oldData,
                    pages: updatedPages,
                }
            })
        },
        onError: (error) => {
            toast.error(error?.message)
        }
    })

    const handleDeleteNotification = (id: number | null | undefined) => {
        if (!id) return
        mutate(id)
    }

    useEffect(() => {
    if (data?.pages?.[0]?.data?.unreadCount !== undefined) {
      setTotalUnread(data.pages[0].data.unreadCount);
    }
  }, [data, setTotalUnread]);

    if (isError) {
        return (
            <div className="flex justify-center items-center mt-10">
                <ErrorMessage type='network' />
            </div>
        )
    }

    if (isLoading) {
        return (
            <>
                <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
                    <h1 className="text-xl font-bold mb-4">Notifications</h1>
                    <Tabs defaultValue="all" className="mt-4">
                        <TabsList className="w-full">
                            <TabsTrigger value="all" className="flex-1">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="mentions" className="flex-1">
                                Mentions
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="space-y-4 p-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )
    }

    if (notifications.length === 0) {
        return (
            <>
                <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
                    <h1 className="text-xl font-bold mb-4">Notifications</h1>
                    <Tabs defaultValue="all" className="mt-4">
                        <TabsList className="w-full">
                            <TabsTrigger value="all" className="flex-1">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="mentions" className="flex-1">
                                Mentions
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No notifications yet</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                        When you get notifications, they'll show up here. Start interacting with others to see them.
                    </p>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
                <h1 className="text-xl font-bold mb-4">Notifications</h1>
                <Tabs defaultValue="all" className="mt-4">
                    <TabsList className="w-full">
                        <TabsTrigger value="all" className="flex-1">
                            All
                        </TabsTrigger>
                        <TabsTrigger value="mentions" className="flex-1">
                            Mentions
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <InfiniteScroll
                hasMore={hasNextPage}
                isLoading={isFetchingNextPage}
                onLoadMore={loadMorePosts}
            >
                <div>
                    {notifications.map((notification) => {
                            const Icon = getNotificationIcon(notification?.type);
                            const { bg, text} = getNotificationColorClasses(notification?.type);

                        return (
                            <div key={notification?.id} className="p-4 cursor-pointer border-b border-border hover:bg-muted/50">
                                <div className="flex gap-3">
                                    <div className="mt-1 relative">
                                        <Avatar className="h-14 w-14">
                                                {notification?.sender?.avatar ? <AvatarImage src={notification?.sender?.avatar} alt={notification?.sender?.full_name} /> :
                                                    <AvatarFallback>{notification?.sender?.full_name?.charAt(0)}</AvatarFallback>}
                                            </Avatar>
                                        <div className={cn(`w-6 h-6 absolute bottom-0 right-0 rounded-full flex justify-center items-center`, bg)}>
                                             {Icon && <Icon className={cn(`w-4 h-4`, text)} />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{notification?.sender?.full_name}</span>
                                            <span className="text-muted-foreground">{getNotificationTitle(notification?.type)}</span>
                                        </div>
                                        {notification?.message && (
                                            <div className="mt-2 text-sm text-muted-foreground line-clamp-1">"{notification?.message}"</div>
                                        )}
                                        <div className="mt-1 text-xs text-muted-foreground">{formatDistanceToNow(notification?.createdAt ?? '')}</div>
                                    </div>
                                    <div className="mt-1">
                                        <Button disabled={isPending} onClick={() => handleDeleteNotification(notification?.id)} className="w-4 h-8 rounded-full bg-destructive text-white">
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {isFetchingNextPage && (
                        <div className="space-y-4 p-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </InfiniteScroll>
        </>
    )
}