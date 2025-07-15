"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Video, Users } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { get_streams } from "@/lib/apis/stream"
import {LiveStreamCardSkeleton} from "@/app/(sidebar-layout)/live/loading"
import { NoLiveStreams } from "@/components/stream-empty-state"



export default function LivePage() {
    const [activeTab, setActiveTab] = useState("browse")

    const { isLoading, data } = useQuery<LiveStreamResponse>({
        queryKey: ['get_streams'],
        queryFn: get_streams
    })

    const liveStreams = data?.data ?? []


    return (
        <>
            <div className="sticky top-0 z-10 bg-background pt-4 pb-2 px-4 border-b border-border">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Live</h1>
                    <Link href="/live/create">
                        <Button size="sm" className="gap-1">
                            <Video className="h-4 w-4" />
                            <span>Go Live</span>
                        </Button>
                    </Link>
                </div>
                <div className="relative mb-4">
                    <Search className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search live streams" className="pl-10" />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="w-full">
                        <TabsTrigger value="browse" className="flex-1">
                            Browse
                        </TabsTrigger>
                        <TabsTrigger value="following" className="flex-1">
                            Following
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="flex-1">
                            Categories
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="p-4">
                {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <LiveStreamCardSkeleton key={i} />
                    ))}
                </div> : liveStreams?.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveStreams?.map((stream) => (
                        <Link href={`/live/${stream.id}`} key={stream.id}>
                            <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
                                <CardContent className="p-0">
                                    <div className="relative">
                                        <img
                                            src={stream.thumbnail || "/live.webp"}
                                            alt={stream.title}
                                            className="w-full aspect-video object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                            <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
                                            LIVE
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {stream.viewers ?? 0}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={stream.user.avatar || "/placeholder.svg"} alt={stream?.user?.full_name} />
                                                <AvatarFallback>{stream?.user?.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-medium line-clamp-1">{stream?.title}</h3>
                                                <p className="text-sm text-muted-foreground">Host By: {stream?.user?.full_name}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs ">
                                                    Topic: <span className="bg-muted px-2 py-0.5 rounded-full">{stream?.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div> : <NoLiveStreams />}
            </div>
        </>
    )
}
