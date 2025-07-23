"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    MapPin,
    Pencil,
    Plus,
    User,
    Users,
} from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import FollowButton from "@/components/follow-button"
import MessageButton from "@/components/message-button"
import { useAuthStore } from "@/store/store"
import { Button } from "@/components/ui/button"
import Link from "next/link"


interface CardHoverTooltipProps {
    children: React.ReactNode,
    user: PostAuthor
}

const CardHoverTooltip = ({ children, user }: CardHoverTooltipProps) => {

    const { user: currentUser } = useAuthStore()

    return (
        <div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {children}
                    </TooltipTrigger>
                    <TooltipContent className="w-80 p-0" side="bottom" align="start">
                        <div className="space-y-3">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-20 rounded-t-lg relative">
                                <Avatar className="absolute -bottom-8 left-4 border-4 border-background w-16 h-16">
                                    {user?.avatar ? <AvatarImage src={user?.avatar} /> : <AvatarFallback>
                                        {user?.full_name?.charAt(0)}
                                    </AvatarFallback>}
                                </Avatar>
                            </div>

                            <div className="pt-10 px-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{user?.full_name}</h3>
                                        <p className="text-muted-foreground text-sm">
                                            @{user?.username}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-2 text-sm">{user?.bio}</p>
                                <div className="flex items-center mt-2 text-muted-foreground text-sm">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{user?.location || 'Unknown location'}</span>
                                </div>

                                <div className="flex gap-4 mt-3 text-sm">
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-1" />
                                        <span>{user?.following_count} Following</span>
                                    </div>
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        <span>{user?.followers_count} Followers</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4 border-t">
                                {
                                    currentUser?.id === user?.id ? <>
                                        <Link href='/story/create'>
                                        <Button>
                                            <Plus />
                                            Add Story
                                        </Button>
                                        </Link>
                                        <Link href="/settings">
                                            <Button>
                                                <Pencil />
                                                Edit Profile
                                            </Button>
                                        </Link>

                                    </> : <>
                                        <MessageButton user={user} />
                                        <FollowButton isFollowing={user?.isFollowing ?? false} id={user?.id} />
                                    </>
                                }
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export default CardHoverTooltip