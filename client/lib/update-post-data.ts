function updatePostInQueryData(
  oldData: PostsResponse | undefined,
  postId: number,
  updateFn: (currentReactions: Reactions) => Reactions
) {
  const updatedPosts = oldData?.data?.posts?.map((post) => {
    if (post.id === postId) {
      return {
        ...post,
        reactions: updateFn(post.reactions),
      };
    }
    return post;
  });

  return {
    ...oldData,
    data: {
      ...oldData?.data,
      posts: updatedPosts,
    },
  };
}

export function addCommentToPost(
  oldData: PostsResponse | undefined,
  postId: number | undefined,
  newComment: CommentPreview
) {
  if (!oldData?.data?.posts) {
    return oldData || { data: { posts: [] } };
  }

  const updatedPosts = oldData.data.posts.map((post) => {
    if (post.id === postId) {
      return {
        ...post,
        comments: {
          total: post.comments.total + 1,
          preview: [newComment, ...(post.comments.preview ?? [])],
        },
      };
    }
    return post;
  });

  return {
    ...oldData,
    data: {
      ...oldData.data,
      posts: updatedPosts,
    },
  };
}

export function addReplyCommentToPost(oldData: PostsResponse | undefined,
  postId: number | undefined,
  commentId: number,
  newComment: RepliesEntity) {
  const updatedPost = oldData?.data?.posts?.map((post) => {
    if (post.id === postId) {
      const updatedComments = post?.comments?.preview?.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [newComment, ...(comment.replies ?? [])],
          };
        }
        return comment;
      });

      return {
        ...post,
        comments: {
          total: post.comments.total + 1,
          preview: updatedComments,
        },
      };
    }

    return post;
  });

  return {
    ...oldData,
    data: {
      posts: updatedPost,
    },
  };
}

export function addCommentReactionToPost(oldData: PostsResponse | undefined,
  postId: number,
  commentId: number,
  parentId: number,
  isReply: boolean | undefined,
  updateFn: (currentReactions: Reactions) => Reactions) {
  const updatedPost = oldData?.data?.posts?.map((post) => {

    if (post.id === postId) {

      const updatedComments = post?.comments?.preview?.map((comment) => {
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
        ...post,
        comments: {
          ...post.comments,
          preview: updatedComments
        }
      }
    }

    return post
  })

  return {
    ...oldData,
    data: {
      ...oldData?.data,
      posts: updatedPost
    }
  }
}

export function editCommentToPost(oldData: PostsResponse | undefined,
  postId: number,
  commentId: number,
  updatedComment: UpdatedCommentPayload) {
  const updatedPosts = oldData?.data?.posts?.map((post) => {

    if (post.id === postId) {

      const updatedComments = post?.comments?.preview?.map((comment) => {
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
        ...post,
        comments: {
          ...post.comments,
          preview: updatedComments
        }
      }
    }

    return post
  })

  return {
    ...oldData,
    data: {
      posts: updatedPosts
    }
  }
}

export function deleteCommentToPost(oldData: PostsResponse | undefined,
  postId: number,
  commentId: number,
  parentId: number,
  isReply:boolean) {
  const updatedPosts = oldData?.data?.posts?.map((post) => {

    let commentsRemovedCount = 0;


    if (post.id === postId) {

      const updatedComments = post?.comments?.preview?.map((commentData) => {

        if (isReply && commentData.id === parentId) {
          const initialRepliesCount = commentData.replies?.length || 0;
          const updatedRepliesComments = commentData?.replies?.filter((repComment) => repComment.id !== commentId)
          const finalRepliesCount = updatedRepliesComments?.length || 0;

          if (initialRepliesCount > finalRepliesCount) {
            commentsRemovedCount += 1;
          }

          return {
            ...commentData,
            replies: updatedRepliesComments
          }
        }

        if (!isReply && commentData.id === commentId) {
          commentsRemovedCount += 1;
          commentsRemovedCount += commentData.replies?.length || 0;
          return null;
        }

        return commentData
      }).filter(Boolean)

      const newTotalComments = post.comments.total - commentsRemovedCount;

      return {
        ...post,
        comments: {
          total: Math.max(0, newTotalComments),
          preview: updatedComments
        }
      }
    }

    return post
  })

  return {
    ...oldData,
    data: {
      posts: updatedPosts
    }
  }
}

export default updatePostInQueryData;
