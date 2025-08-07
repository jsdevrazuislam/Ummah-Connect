import type React from "react";
import type { FC } from "react";

import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Phone, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { OutgoingCallModal } from "@/components/outgoing-call-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCallActions } from "@/hooks/use-call-store";
import { initializeCall } from "@/lib/apis/stream";
import { showError } from "@/lib/toast";
import { cn } from "@/lib/utils";

type ConversationHeaderProps = {
  getIsUserOnline: (userId: number) => boolean;
  getUserLastSeen: (userId: number) => number;
  selectedConversation: MessageSender | null;
  className?: string;
};

const ConversationHeader: FC<ConversationHeaderProps> = ({
  getIsUserOnline,
  selectedConversation,
  getUserLastSeen,
  className,
}) => {
  const [isCalling, setIsCalling] = useState(false);

  const { mutate } = useMutation({
    mutationFn: initializeCall,
    onError: (error) => {
      showError(error.message);
    },
  });
  const { startCall } = useCallActions();

  const handleStartCall = (callType: "audio" | "video") => {
    if (!selectedConversation || !selectedConversation?.id)
      return;
    const authToken = uuidv4();
    const roomName = `call-${selectedConversation.id}-${Date.now()}`;
    mutate({
      roomName,
      callType,
      authToken,
      receiverId: String(selectedConversation?.id),
    });
    startCall();
    setIsCalling(true);
  };

  if (!selectedConversation)
    return;

  return (
    <>
      <div className={cn(`p-4 md:border-b md:border-border w-full flex justify-between items-center`, className)}>
        <Link href={`/${selectedConversation?.username}`} className="flex items-center gap-3 cursor-pointer">
          <Avatar>
            <AvatarImage src={selectedConversation?.avatar} alt={selectedConversation?.fullName} />
            <AvatarFallback>{selectedConversation?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium capitalize">{selectedConversation?.fullName}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {getIsUserOnline(selectedConversation?.id) ? "Online" : getUserLastSeen(selectedConversation?.id) === 0 ? formatDistanceToNow(new Date(selectedConversation?.lastSeenAt ?? "")) : formatDistanceToNow(new Date(getUserLastSeen(selectedConversation?.id)), { addSuffix: true })}
            </div>
          </div>
        </Link>
        <div className="flex">
          <Button variant="ghost" size="icon" onClick={() => handleStartCall("audio")}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleStartCall("video")}>
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <OutgoingCallModal isOpen={isCalling} onClose={() => setIsCalling(false)} />
    </>
  );
};

export default ConversationHeader;
