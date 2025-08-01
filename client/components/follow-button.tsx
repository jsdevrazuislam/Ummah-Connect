import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import SocketEventEnum from "@/constants/socket-event";
import { useSocketStore } from "@/hooks/use-socket";
import { followUnFollow } from "@/lib/apis/follow";
import { showError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";

function FollowButton({ isFollowing, id, className, iconClassName }: { isFollowing: boolean; id: number; className?: string; iconClassName?: string }) {
  const [follow, setFollow] = useState(isFollowing);
  const { user, setUser } = useStore();
  const { socket } = useSocketStore();

  const { mutate } = useMutation({
    mutationFn: followUnFollow,
    onSuccess: () => {
      setFollow(prev => !prev);

      if (user) {
        const updatedFollowersCount = follow
          ? Math.max(0, user.followingCount - 1)
          : user.followingCount + 1;

        socket?.emit(follow ? SocketEventEnum.UNFOLLOW_USER : SocketEventEnum.FOLLOW_USER, {
          toUserId: id,
          fromUser: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
          },
        });

        setUser({
          ...user,
          followingCount: updatedFollowersCount,
        });
      }
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleFollow = () => {
    mutate(id);
  };

  return (
    <Button className={cn(className)} onClick={handleFollow} size="sm">
      <UserPlus className={cn("h-4 w-4", iconClassName)} />
      {follow ? "Unfollow" : "Follow"}
    </Button>
  );
}

export default FollowButton;
