"use client"

import SocketEventEnum from "@/constants/socket-event";
import { useCallActions } from "@/hooks/use-call-store";
import { useConversationStore } from "@/hooks/use-conversation-store";
import { useSocketStore } from "@/hooks/use-socket";
import { read_message } from "@/lib/apis/conversation";
import { addedConversation, addLastMessage, addMessageConversation, addMessageConversationLiveStream, addUnReadCount, updateParticipantCount } from "@/lib/update-conversation";
import updatePostInQueryData, { addCommentReactionToPost, addCommentToPost, addReplyCommentToPost, deleteCommentToPost, editCommentToPost, incrementDecrementCommentCount } from "@/lib/update-post-data";
import { useAuthStore } from "@/store/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const SocketEvents = () => {

  const { socket } = useSocketStore()
  const queryClient = useQueryClient();
  const { user, selectedConversation, markUserOffline, markUserOnline, updateLastSeen } = useAuthStore()
  const { setIncomingCall, setRejectedCallInfo, stopRingtone, setCallStatus, endCall, setShowEndModal, setHostUsername } = useCallActions();
  const { incrementUnreadCount } = useConversationStore()
  const router = useRouter()


  const { mutate: readMessageFun } = useMutation({
    mutationFn: read_message,
    onError: (error) => {
      toast.error(error.message)
    }
  })


  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.POST_REACT, (payload: PostReactPayload) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
        return updatePostInQueryData(oldData, payload.postId, payload.postData)
      })
    });

    return () => {
      socket.off(SocketEventEnum.POST_REACT);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.CREATE_COMMENT, (payload: CreateCommentPayload) => {
      queryClient.setQueryData(['get_comments', payload?.data?.postId], (oldData: QueryOldDataCommentsPayload) => {
        return addCommentToPost(oldData, payload?.data?.postId, payload.data)
      })
      queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
        return incrementDecrementCommentCount(oldData, payload?.data?.postId, payload?.data?.totalComments ?? 0)
      })
    });

    return () => {
      socket.off(SocketEventEnum.CREATE_COMMENT);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.REPLY_COMMENT, (payload: CreateCommentReplyPayload) => {
      queryClient.setQueryData(['get_comments', payload?.data?.postId], (oldData: QueryOldDataCommentsPayload) => {
        return addReplyCommentToPost(oldData, payload.data.parentId, payload.data)
      })

      queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
        return incrementDecrementCommentCount(oldData, payload?.data?.postId, payload?.data?.totalComments ?? 0)
      })
    });

    return () => {
      socket.off(SocketEventEnum.REPLY_COMMENT);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.COMMENT_REACT, (payload: CommentReactPayload) => {
      queryClient.setQueryData(['get_comments', payload?.postId], (oldData: QueryOldDataCommentsPayload) => {
        return addCommentReactionToPost(oldData, payload?.commentId, payload?.parentId, payload?.isReply, payload?.data?.totalReactionsCount ?? 0)
      })
    });

    return () => {
      socket.off(SocketEventEnum.COMMENT_REACT);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.EDITED_COMMENT, (payload: UpdatedCommentPayload) => {
      queryClient.setQueryData(['get_comments', payload?.postId], (oldData: QueryOldDataCommentsPayload) => {
        return editCommentToPost(oldData, payload.id, payload)
      })
    });
    return () => {
      socket.off(SocketEventEnum.EDITED_COMMENT);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.DELETE_COMMENT, (payload: DeleteCommentPayload) => {
      queryClient.setQueryData(['get_comments', payload?.postId], (oldData: QueryOldDataCommentsPayload) => {
        if (!oldData) return { pageParams: [], pages: [] }
        return deleteCommentToPost(oldData, payload.id, payload.parentId, payload.isReply)
      })
      queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
        return incrementDecrementCommentCount(oldData, payload?.postId, payload?.totalComments ?? 0)
      })
    });
    return () => {
      socket.off(SocketEventEnum.DELETE_COMMENT);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.SEND_MESSAGE_TO_CONVERSATION, (payload: ConversationMessages) => {
      if (payload?.sender_id !== user?.id) {
        queryClient.setQueryData(['get_conversation_messages', payload.conversation_id], (oldData: QueryOldDataPayloadConversation) => {
          if (selectedConversation?.conversationId === payload.conversation_id) {
            readMessageFun({
              conversationId: payload.conversation_id,
              messageId: payload.id,
            })
          }
          socket.emit(SocketEventEnum.MESSAGE_RECEIVED, payload.id.toString());
          return addMessageConversation(oldData, payload, payload.conversation_id)
        })
        if (selectedConversation?.conversationId !== payload.conversation_id) {
          queryClient.setQueryData(['get_conversations'], (oldData: QueryOldDataPayloadConversations) => {
            return addUnReadCount(oldData, payload.conversation_id)
          })
          incrementUnreadCount(payload.conversation_id)
        }
      }

       queryClient.setQueryData(['get_conversations'], (oldData: QueryOldDataPayloadConversations) => {
          return addLastMessage(oldData, payload.conversation_id, payload)
        })
    });
    return () => {
      socket.off(SocketEventEnum.SEND_MESSAGE_TO_CONVERSATION);
    };
  }, [socket, user, selectedConversation]);

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.SEND_CONVERSATION_REQUEST, (payload: Conversation) => {
      queryClient.setQueryData(['get_conversations'], (oldData: QueryOldDataPayloadConversations) => {
        return addedConversation(oldData, payload, payload?.id)
      })
    });
    return () => {
      socket.off(SocketEventEnum.SEND_CONVERSATION_REQUEST);
    };
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.ONLINE, ({ userId }: { userId: number }) => {
      markUserOnline(userId)
    });
    return () => {
      socket.off(SocketEventEnum.ONLINE);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.OFFLINE, ({ userId, lastSeen }: { userId: number, lastSeen: number }) => {
      markUserOffline(userId)
      updateLastSeen(userId, lastSeen)
    });
    return () => {
      socket.off(SocketEventEnum.OFFLINE);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.INCOMING_CALL, (payload) => {
      setIncomingCall(payload)
    });
    return () => {
      socket.off(SocketEventEnum.INCOMING_CALL);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.CALL_ACCEPTED, () => {
      stopRingtone()
    });
    return () => {
      socket.off(SocketEventEnum.CALL_ACCEPTED);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.CALL_REJECTED, (payload) => {
      setRejectedCallInfo(payload)
      router.push('/')
    });
    return () => {
      socket.off(SocketEventEnum.CALL_REJECTED);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.CALLER_LEFT, (payload) => {
      setRejectedCallInfo(payload)
      setCallStatus('ended')
      endCall()
      router.push('/')
    });
    return () => {
      socket.off(SocketEventEnum.CALLER_LEFT);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.CALL_TIMEOUT, (payload) => {
      endCall()
      setRejectedCallInfo(payload)
      setCallStatus('missed')
      router.push('/')
    });
    return () => {
      socket.off(SocketEventEnum.CALL_TIMEOUT);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.HOST_END_LIVE_STREAM, (payload) => {
      setShowEndModal(true)
      setHostUsername(payload?.username)
      router.push('/')
    });
    return () => {
      socket.off(SocketEventEnum.HOST_END_LIVE_STREAM);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.LIVE_CHAT_SEND, (payload: LiveStreamChatData) => {
      if (payload?.sender_id !== user?.id) {
        queryClient.setQueryData(['get_stream_messages'], (oldData: QueryOldDataPayloadLiveStreamChats) => {
          return addMessageConversationLiveStream(oldData, payload, payload?.stream_id)
        })
      }
    });
    return () => {
      socket.off(SocketEventEnum.LIVE_CHAT_SEND);
    };
  }, [socket, user]);


  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.LIVE_VIEW_COUNT, (payload) => {
      queryClient.setQueryData(['get_streams'], (oldData: LiveStreamResponse) => {
        return updateParticipantCount(oldData, Number(payload?.streamId), payload?.count ?? 0)
      })
    });
    return () => {
      socket.off(SocketEventEnum.LIVE_VIEW_COUNT);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.USER_KICK_FROM_LIVE, () => {
      router.refresh()
    });
    return () => {
      socket.off(SocketEventEnum.USER_KICK_FROM_LIVE);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEventEnum.BAN_VIEWER_FROM_MY_LIVE_STREAM, () => {
      router.refresh()
    });
    return () => {
      socket.off(SocketEventEnum.BAN_VIEWER_FROM_MY_LIVE_STREAM);
    };
  }, [socket]);

  return null
}

export default SocketEvents