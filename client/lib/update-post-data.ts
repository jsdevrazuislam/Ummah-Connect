function updatePostInQueryData(
  oldData: QueryOldDataPayload | undefined,
  postId: number,
  data: PostsEntity,
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
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function addCommentToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  postId: number | undefined,
  newComment: CommentPreview,
) {
  if (!oldData || !postId)
    return oldData;

  const updatedPages = oldData.pages.map((page) => {
    const existingComments = page.data.comments ?? [];
    const shouldAddComment = existingComments.length === 0 || existingComments.some(c => c.postId === postId);

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

/**
 * Adds a reply to a specific comment in paginated comment data.
 * Efficiently finds the target comment and updates only the necessary page.
 *
 * @param oldData - The existing paginated comments data.
 * @param commentId - The ID of the comment to reply to.
 * @param newComment - The reply object to insert.
 * @returns Updated query data with the new reply added.
 */
export function addReplyCommentToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  commentId: number,
  newComment: RepliesEntity,
) {
  if (!oldData)
    return oldData;

  let found = false;

  const updatedPages = oldData.pages.map((page) => {
    if (found)
      return page;

    const comments = page?.data?.comments ?? [];
    const index = comments.findIndex(comment => comment.id === commentId);

    if (index === -1)
      return page;

    found = true;

    const targetComment = comments[index];
    const updatedComment = {
      ...targetComment,
      replies: [newComment, ...(targetComment.replies ?? [])],
    };

    const updatedComments = [...comments];
    updatedComments[index] = updatedComment;

    return {
      ...page,
      data: {
        ...page.data,
        comments: updatedComments,
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function addCommentReactionToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  commentId: number,
  parentId: number,
  isReply: boolean | undefined,
  amount: number | string,
) {
  const updatedPages = oldData?.pages?.map((page) => {
    const updatedComments = page?.data?.comments?.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          totalReactionsCount: amount,
        };
      }
      if (isReply && comment.id === parentId) {
        const updatedReplies = comment?.replies?.map((replyComment) => {
          if (replyComment.parentId === parentId && replyComment.id === commentId) {
            return {
              ...replyComment,
              totalReactionsCount: amount,
            };
          }
          return replyComment;
        });

        return {
          ...comment,
          replies: updatedReplies,
        };
      }
      return comment;
    });

    return {
      ...page,
      data: {
        ...page.data,
        comments: updatedComments,
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function editCommentToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  commentId: number,
  updatedComment: UpdatedCommentPayload,
) {
  const updatedPages = oldData?.pages?.map((page) => {
    const updatedComments = page?.data?.comments?.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          ...updatedComment,
        };
      }

      if (updatedComment.isReply) {
        const updatedRepliesComments = comment?.replies?.map((reply) => {
          if (reply.parentId === updatedComment.parentId && reply.id === updatedComment.id) {
            return {
              ...reply,
              ...updatedComment,
            };
          }

          return reply;
        });

        return {
          ...comment,
          replies: updatedRepliesComments,
        };
      }
      return comment;
    });

    return {
      ...page,
      data: {
        ...page.data,
        comments: updatedComments,
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export function deleteCommentToPost(
  oldData: QueryOldDataCommentsPayload | undefined,
  commentId: number,
  parentId: number,
  isReply: boolean,
) {
  const updatedPages = oldData?.pages?.map((page) => {
    const updatedComments = page?.data?.comments?.map((commentData) => {
      if (isReply && commentData.id === parentId) {
        const updatedRepliesComments = commentData?.replies?.filter(repComment => repComment.id !== commentId);
        return {
          ...commentData,
          replies: updatedRepliesComments,
        };
      }

      if (!isReply && commentData.id === commentId) {
        return null;
      }
      return commentData;
    }).filter(Boolean);

    return {
      ...page,
      data: {
        ...page.data,
        comments: updatedComments,
      },
    };
  });
  return {
    ...oldData,
    pages: updatedPages,
  };
}

/**
 * Optimistically increments or decrements the total comment count of a post in paginated query data.
 * Stops early as soon as the post is found (O(1) in practical terms).
 *
 * @param oldData - The current paginated data for posts.
 * @param postId - The ID of the post to update.
 * @param amount - The amount to increment/decrement.
 * @param actions - Whether to 'inc' or 'dec' the count (default is 'inc').
 * @returns Updated query data with the post's comment count changed.
 */
export function incrementDecrementCommentCount(
  oldData: QueryOldDataPayload | undefined,
  postId: number | undefined,
  amount: number,
  actions: "inc" | "dec" = "inc",
) {
  if (!oldData || !postId)
    return oldData;

  let found = false;

  const updatedPages = oldData.pages.map((page) => {
    if (found)
      return page; // skip other pages

    const posts = page?.data?.posts ?? [];
    const index = posts.findIndex(post => post.id === postId);

    if (index === -1)
      return page;

    found = true;

    const targetPost = posts[index];
    const updatedPost = {
      ...targetPost,
      totalCommentsCount: Math.max(
        (actions === "inc"
          ? Number(targetPost.totalCommentsCount) + amount
          : Number(targetPost.totalCommentsCount) - amount),
        0,
      ),
    };

    const updatedPosts = [...posts];
    updatedPosts[index] = updatedPost;

    return {
      ...page,
      data: {
        ...page.data,
        posts: updatedPosts,
      },
    };
  });

  return {
    ...oldData,
    pages: updatedPages,
  };
}

export default updatePostInQueryData;
