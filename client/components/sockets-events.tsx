"use client"

import SocketEventEnum from "@/constants/socket-event";
import { useSocketStore } from "@/hooks/use-socket";
import updatePostInQueryData, { addCommentToPost, addReplyCommentToPost } from "@/lib/update-post-data";
import { useAuthStore } from "@/store/store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const SocketEvents = () => {

  const { socket } = useSocketStore()
  const queryClient = useQueryClient();
  const { user } = useAuthStore()


  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.POST_REACT, (data) => {
      queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {
        return updatePostInQueryData(oldData, data.postId, () => ({
          ...data?.postData?.reactions
        }))
      })
    });

    return () => {
      socket.off(SocketEventEnum.POST_REACT);
    };
  }, [socket]);


  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.CREATE_COMMENT, (payload) => {
      if (payload?.data?.user?.id !== user?.id) {
        queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {
          return addCommentToPost(oldData, payload.data.postId, payload.data)
        })
      }
    });

    return () => {
      socket.off(SocketEventEnum.CREATE_COMMENT);
    };
  }, [socket, user]);


  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.REPLY_COMMENT, (payload) => {
      if (payload?.data?.user?.id !== user?.id) {
        queryClient.setQueryData(['get_all_posts'], (oldData: PostsResponse) => {
          return addReplyCommentToPost(oldData, payload.data.postId, payload.data.parentId, payload.data)
        })
      }
    });

    return () => {
      socket.off(SocketEventEnum.REPLY_COMMENT);
    };
  }, [socket, user]);

  return null
}

export default SocketEvents