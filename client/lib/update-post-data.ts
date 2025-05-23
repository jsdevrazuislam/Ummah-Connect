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
  postId: number,
  newComment: Comment
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
  postId: number,
  commentId: number,
  newComment: Comment) {
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

export default updatePostInQueryData;
