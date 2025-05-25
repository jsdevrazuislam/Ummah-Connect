function updatePostInQueryData(
  oldData: QueryOldDataPayload | undefined,
  postId: number,
  updateFn: (currentReactions: Reactions) => Reactions
) {

  const updatedPages = oldData?.pages?.map((page) => {
    const updatedPosts = page?.data?.posts?.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          reactions: updateFn(post.reactions),
        };
      }
      return post;
    });

    return {
      ...page,
      data: {
        ...page.data,
        posts: updatedPosts,
      },
    }
  })


  return {
    ...oldData,
    pages: updatedPages
  };
}

export function addCommentToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  postId: number | undefined,
  newComment: CommentPreview
) {
  if (!oldData || !postId) return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingComments = page.data.comments ?? [];
    const shouldAddComment = existingComments.length === 0 || existingComments.some((c) => c.postId === postId);

    if (shouldAddComment) {
      return {
        ...page,
        data: {
          ...page.data,
          comments: [newComment, ...existingComments],
        },
      };
    }

    return page;
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}


export function addReplyCommentToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  commentId: number,
  newComment: RepliesEntity) {

  const updatedPages = oldData?.pages?.map((page) => {

    const updatedComments = page?.data?.comments?.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [newComment, ...(comment.replies ?? [])],
        };
      }
      return comment;
    });

    return {
      ...page,
      data: {
        ...page.data,
        comments: updatedComments
      }
    };
  })

  return {
    ...oldData,
    pages: updatedPages
  };
}

export function addCommentReactionToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  commentId: number,
  parentId: number,
  isReply: boolean | undefined,
  updateFn: (currentReactions: Reactions) => Reactions) {

  const updatedPages = oldData?.pages?.map((page) => {
    const updatedComments = page?.data?.comments?.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          reactions: updateFn(comment.reactions)
        }
      }
      if (isReply && comment.id === parentId) {

        const updatedReplies = comment?.replies?.map((replyComment) => {
          if (replyComment.parentId === parentId && replyComment.id === commentId) {
            return {
              ...replyComment,
              reactions: updateFn(replyComment.reactions)
            }
          }
          return replyComment
        })

        return {
          ...comment,
          replies: updatedReplies
        }
      }
      return comment
    })

    return {
      ...page,
      data: {
        ...page.data,
        comments: updatedComments
      }
    }
  })


  return {
    ...oldData,
    pages: updatedPages
  }
}

export function editCommentToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  commentId: number,
  updatedComment: UpdatedCommentPayload) {

  const updatedPages = oldData?.pages?.map((page) => {

    const updatedComments = page?.data?.comments?.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          ...updatedComment
        }
      }

      if (updatedComment.isReply) {

        const updatedRepliesComments = comment?.replies?.map((reply) => {

          if (reply.parentId === updatedComment.parentId && reply.id === updatedComment.id) {
            return {
              ...reply,
              ...updatedComment
            }
          }

          return reply
        })

        return {
          ...comment,
          replies: updatedRepliesComments
        }
      }
      return comment
    })

    return {
      ...page,
      data: {
        ...page.data,
        comments: updatedComments
      }
    }
  })


  return {
    ...oldData,
    pages: updatedPages
  }
}

export function deleteCommentToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  commentId: number,
  parentId: number,
  isReply: boolean) {

  const updatedPages = oldData?.pages?.map((page) => {

    const updatedComments = page?.data?.comments?.map((commentData) => {

      if (isReply && commentData.id === parentId) {
        const initialRepliesCount = commentData.replies?.length || 0;
        const updatedRepliesComments = commentData?.replies?.filter((repComment) => repComment.id !== commentId)
        const finalRepliesCount = updatedRepliesComments?.length || 0;

        if (initialRepliesCount > finalRepliesCount) {
        }

        return {
          ...commentData,
          replies: updatedRepliesComments
        }
      }

      if (!isReply && commentData.id === commentId) {
        return null;
      }
      return commentData
    }).filter(Boolean)


    return {
      ...page,
      data: {
        ...page.data,
        comments: updatedComments
      }
    }


  })
  return {
    ...oldData,
    pages: updatedPages
  }
}

export function incrementDecrementCommentCount(
  oldData: QueryOldDataPayload | undefined,
  postId: number | undefined,
  amount: number
) {

  const updatedPages = oldData?.pages?.map((page) => {

    const updatedPosts = page?.data?.posts?.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: {
            total: amount,
          },
        }
      }

      return post
    })

    return {
      ...page,
      data: {
        ...page.data,
        posts: updatedPosts
      }
    }
  })

  return {
    ...oldData,
    pages: updatedPages
  }
}

export default updatePostInQueryData;
