function updatePostInQueryData(
  oldData: QueryOldDataPayload | undefined,
  postId: number,
  data: PostsEntity
) {

  const updatedPages = oldData?.pages?.map((page) => {
    const updatedPosts = page?.data?.posts?.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          totalReactionsCount: data?.totalReactionsCount,
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
  amount: number | string
) {

  const updatedPages = oldData?.pages?.map((page) => {
    const updatedComments = page?.data?.comments?.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          totalReactionsCount: amount
        }
      }
      if (isReply && comment.id === parentId) {

        const updatedReplies = comment?.replies?.map((replyComment) => {
          if (replyComment.parentId === parentId && replyComment.id === commentId) {
            return {
              ...replyComment,
              totalReactionsCount: amount
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
        const updatedRepliesComments = commentData?.replies?.filter((repComment) => repComment.id !== commentId)
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
  amount: number,
  actions: "inc" | "dec" = "inc"
) {
  if (!oldData || !postId) return oldData

  const updatedPages = oldData.pages?.map((page) => {
    const updatedPosts = page?.data?.posts?.map((post) => {
      if (post.id === postId) {
        const newCount =
          actions === "inc"
            ? Number(post.totalCommentsCount) + amount
            : Number(post.totalCommentsCount) - amount

        return {
          ...post,
          totalCommentsCount: Math.max(newCount, 0),
        }
      }

      return post
    })

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
    pages: updatedPages,
  }
}

export default updatePostInQueryData;
