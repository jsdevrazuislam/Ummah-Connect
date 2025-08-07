import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { removeReactionFromMessage } from "@/lib/apis/conversation";
import { showError } from "@/lib/toast";

type ReactionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reactions: MessageReaction[];
  currentUserId: number | undefined;
  messageId: number;
};

export function ReactionsModal({
  isOpen,
  onClose,
  reactions,
  currentUserId,
  messageId,
}: ReactionsModalProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const reactionsByEmoji = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const allEmojis = Object.keys(reactionsByEmoji);

  const filteredReactions = selectedEmoji
    ? reactionsByEmoji[selectedEmoji] || []
    : reactions;

  const { mutate: deleteReactFunc } = useMutation({
    mutationFn: removeReactionFromMessage,
    onError: (error) => {
      showError(error.message);
    },
  });

  if (!currentUserId)
    return;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[550px] p-0">
        <DialogHeader className="border-b p-4">
          <div className="flex m-auto justify-between items-center">
            <DialogTitle className="text-lg">
              Message reactions
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 p-4">
          <Button
            variant={!selectedEmoji ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedEmoji(null)}
          >
            All (
            {reactions.length}
            )
          </Button>
          {allEmojis.map(emoji => (
            <Button
              key={emoji}
              variant={selectedEmoji === emoji ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedEmoji(emoji)}
            >
              {emoji}
              {" "}
              (
              {reactionsByEmoji[emoji].length}
              )
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[300px]">
          <div className="flex flex-col gap-4 p-4">
            {
              filteredReactions?.map(user => (
                <div key={`${user.emoji}-${user.id}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {
                        user?.reactedUser?.avatar
                          ? <AvatarImage src={user?.reactedUser?.avatar} />
                          : (
                              <AvatarFallback>
                                {user?.reactedUser?.fullName?.charAt(0)}
                              </AvatarFallback>
                            )
                      }
                    </Avatar>
                    <span className="font-medium">{user?.reactedUser?.fullName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xl">{user.emoji}</span>
                    {user.reactedUser?.id === currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          deleteReactFunc(messageId);
                          onClose();
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
