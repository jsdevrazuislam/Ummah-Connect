"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, CheckCheck, Trash } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { deleteNotification, markAllRead } from "@/lib/apis/notification"
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
import { useStore } from "@/store/store"
import { cn } from "@/lib/utils"


export default function NotificationsPage() {

    const {
        notifications,
        fetchNotifications,
        hasMoreNotifications,
        deleteNotificationFromStore,
        notificationErrorMessage,
        notificationLoading,
        markAsRead
    } = useStore()

    const { mutate: muFun } = useMutation({
        mutationFn: markAllRead,
        onSuccess: () =>{
            markAsRead()
        }
    })

    const loadMorePosts = () => {
        if (hasMoreNotifications) {
            fetchNotifications();
        }
    };

    const { mutate, isPending } = useMutation({
        mutationFn: deleteNotification,
        onSuccess: (_data, deletedId) => {
            deleteNotificationFromStore(deletedId);
        },
        onError: (error) => {
            toast.error(error?.message)
        }
    })

    const handleDeleteNotification = (id: number | null | undefined) => {
        if (!id) return
        mutate(id)
    }

    if (notificationErrorMessage) {
        return (
            <div className="flex justify-center items-center mt-10">
                <ErrorMessage type='network' />
            </div>
        )
    }

    if (notificationLoading) {
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
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Notifications</h1>
                    <Button variant='outline' onClick={() => muFun()}>
                        <CheckCheck className="w-8 h-8" />
                        Mark All Read
                    </Button>
                </div>
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
                hasMore={hasMoreNotifications}
                isLoading={notificationLoading}
                onLoadMore={loadMorePosts}
            >
                <div>
                    {notifications.map((notification) => {
                        const Icon = getNotificationIcon(notification?.type);
                        const { bg, text } = getNotificationColorClasses(notification?.type);

                        return (
                            <div key={notification?.id} className="p-4 relative cursor-pointer border-b border-border hover:bg-muted/50">
                                {
                                    !notification?.is_read && <div className="w-2 h-2 rounded-full bg-primary absolute right-7 top-[60%]" />
                                }
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

                    {notificationLoading && (
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