import { Post, ReactPostType } from "@/types/post";
import { formatTimeAgo } from "@/utils/helper";


function reactions(posts: ReactPostType[], userId: number) {
  const reactionCounts = posts.reduce((acc, reaction) => {
    acc[reaction.react_type] = (acc[reaction.react_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const currentUserReaction = posts.find((r) => r.userId === userId);

  return {
    reactions: {
      counts: reactionCounts,
      currentUserReaction: currentUserReaction?.react_type || null,
    }
  }
}


export const formatPosts = (posts: any[], currentUserId: number) => {

  const plainPosts = posts.map(post => post.get({ plain: true }));

  const formattedPosts = plainPosts?.map((post: Post) => {

    const currentPostReactions = post?.reactions?.filter((r) => r?.postId === post.id);

    const commentPreview = post?.comments?.map((comment) => {

      const currentCommentReactions = comment?.reactions?.filter((r) => r?.commentId === comment.id);

      const repliesPreview = comment?.replies?.map((replyComment) => {

        const currentReplyCommentReactions = replyComment?.reactions?.filter((r) => r?.commentId === replyComment.id);

        return {
          ...replyComment,
          ...reactions(currentReplyCommentReactions ?? [], currentUserId),
        }

      })

      return {
        ...comment,
        ...reactions(currentCommentReactions ?? [], currentUserId),
        replies: repliesPreview
      }
    })

    const bookmarkPostIds = new Set(post?.bookmarks?.map((b) => b.postId));
    const isBookmarked = bookmarkPostIds.has(post.id);


    return {
      id: post.id,
      user: post.user,
      content: post.content,
      timestamp: formatTimeAgo(new Date(post.createdAt)),
      privacy: post.privacy,
      isBookmarked,
      originalPost: post.originalPost ,
      comments: {
        total: Number(post.totalCommentsCount),
        preview: commentPreview
      },
      shares: post.share,
      image: post.media,
      location: post.location,
      ...reactions(currentPostReactions ?? [], currentUserId)
    }
  })

  return formattedPosts;
};
