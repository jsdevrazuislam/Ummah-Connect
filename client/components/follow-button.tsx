import React from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { useMutation } from "@tanstack/react-query"
import { followUnFollow } from "@/lib/apis/follow"
import { toast } from "sonner"
import { useState } from "react"

const FollowButton = ({ isFollowing, id }: { isFollowing: boolean, id: number }) => {

    const [follow, setFollow] = useState(isFollowing)

    const { mutate } = useMutation({
        mutationFn: followUnFollow,
        onSuccess: () => {
            setFollow(!follow)
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