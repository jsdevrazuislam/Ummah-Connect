import React from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { useMutation } from "@tanstack/react-query"
import { followUnFollow } from "@/lib/apis/follow"
import { toast } from "sonner"
import { useState } from "react"
import { useStore } from '@/store/store'
import { useSocketStore } from '@/hooks/use-socket'
import SocketEventEnum from '@/constants/socket-event'

const FollowButton = ({ isFollowing, id }: { isFollowing: boolean, id: number }) => {

    const [follow, setFollow] = useState(isFollowing)
    const { user, setUser } = useStore()
    const { socket } = useSocketStore()

    const { mutate } = useMutation({
        mutationFn: followUnFollow,
        onSuccess: () => {
            setFollow(prev => !prev)

            if (user) {
                const updatedFollowersCount = follow
                    ? Math.max(0, user.following_count - 1)
                    : user.following_count + 1;

                socket?.emit(follow ? SocketEventEnum.UNFOLLOW_USER : SocketEventEnum.FOLLOW_USER, {
                    toUserId: id,
                    fromUser: {
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar
                    }
                })

                setUser({
                    ...user,
                    following_count: updatedFollowersCount
                });
            }
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const handleFollow = () => {
        mutate(id)
    }

    return (
        <Button onClick={handleFollow} size="sm">
            <UserPlus className="h-4 w-4" />
            {follow ? 'Unfollow' : 'Follow'}
        </Button>
    )
}

export default FollowButton