"use client"

import SocketEventEnum from "@/constants/socket-event";
import { useSocketStore } from "@/hooks/use-socket";
import updatePostInQueryData, { addCommentReactionToPost, addCommentToPost, addReplyCommentToPost, deleteCommentToPost, editCommentToPost, incrementDecrementCommentCount } from "@/lib/update-post-data";
import { useAuthStore } from "@/store/store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const SocketEvents = () => {

  const { socket } = useSocketStore()
  const queryClient = useQueryClient();
  const { user } = useAuthStore()


  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.POST_REACT, (payload: PostReactPayload) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
        return updatePostInQueryData(oldData, payload.postId, () => ({
          ...payload?.postData?.reactions
        }))
      })
    });

    return () => {
      socket.off(SocketEventEnum.POST_REACT);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.CREATE_COMMENT, (payload: CreateCommentPayload) => {
      if (payload?.data?.user?.id !== user?.id) {
        queryClient.setQueryData(['get_comments', payload?.data?.postId], (oldData: QueryOldDataCommentsPayload) => {
          return addCommentToPost(oldData, payload?.data?.postId, payload.data)
        })
        queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
            return incrementDecrementCommentCount(oldData, payload?.data?.postId, payload?.data?.totalComments ?? 0)
        })
      }
    });

    return () => {
      socket.off(SocketEventEnum.CREATE_COMMENT);
    };
  }, [socket, user]);


  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.REPLY_COMMENT, (payload: CreateCommentReplyPayload) => {
      if (payload?.data?.user?.id !== user?.id) {
        queryClient.setQueryData(['get_comments', payload?.data?.postId], (oldData: QueryOldDataCommentsPayload) => {
          return addReplyCommentToPost(oldData, payload.data.parentId, payload.data)
        })
        
        queryClient.setQueryData(['get_all_posts'], (oldData: QueryOldDataPayload) => {
            return incrementDecrementCommentCount(oldData, payload?.data?.postId, payload?.data?.totalComments ?? 0)
        })
      }
    });

    return () => {
      socket.off(SocketEventEnum.REPLY_COMMENT);
    };
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.COMMENT_REACT, (payload: CommentReactPayload) => {
      queryClient.setQueryData(['get_comments', payload?.postId], (oldData: QueryOldDataCommentsPayload) => {
        return addCommentReactionToPost(oldData, payload?.commentId, payload?.parentId, payload?.isReply, () => ({
          ...payload?.data?.reactions
        }))
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
        return deleteCommentToPost(oldData, payload.id, payload.parentId, payload.isReply)
      })
    });
    return () => {
      socket.off(SocketEventEnum.DELETE_COMMENT);
    };
  }, [socket]);

  return null
}

export default SocketEvents