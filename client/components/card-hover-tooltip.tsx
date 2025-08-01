"use client";

import {
  MapPin,
  Pencil,
  Plus,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";

import FollowButton from "@/components/follow-button";
import MessageButton from "@/components/message-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStore } from "@/store/store";

type CardHoverTooltipProps = {
  children: React.ReactNode;
  user: PostAuthor;
};

function CardHoverTooltip({ children, user }: CardHoverTooltipProps) {
  const { user: currentUser } = useStore();

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
                  {user?.avatar
                    ? <AvatarImage src={user?.avatar} />
                    : (
                        <AvatarFallback>
                          {user?.fullName?.charAt(0)}
                        </AvatarFallback>
                      )}
                </Avatar>
              </div>

              <div className="pt-10 px-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{user?.fullName}</h3>
                    <p className="text-muted-foreground text-sm">
                      @
                      {user?.username}
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-sm">{user?.bio}</p>
                <div className="flex items-center mt-2 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{user?.location || "Unknown location"}</span>
                </div>

                <div className="flex gap-4 mt-3 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>
                      {user?.followingCount ?? 0}
                      {" "}
                      Following
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>
                      {user?.followersCount ?? 0}
                      {" "}
                      Followers
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 border-t">
                {
                  currentUser?.id === user?.id
                    ? (
                        <>
                          <Link href="/story/create">
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

                        </>
                      )
                    : (
                        <>
                          <MessageButton user={user} />
                          <FollowButton isFollowing={user?.isFollowing ?? false} id={user?.id} />
                        </>
                      )
                }
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default CardHoverTooltip;
