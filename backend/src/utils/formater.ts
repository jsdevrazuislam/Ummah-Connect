import { ConversationData } from "@/types/conversation";
import { CommentsEntity, Post, ReactPostType } from "@/types/post";
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

    const bookmarkPostIds = new Set(post?.bookmarks?.map((b) => b.postId));
    const isBookmarked = bookmarkPostIds.has(post.id);


    return {
      id: post.id,
      user: post.user,
      content: post.content,
      timestamp: formatTimeAgo(new Date(post.createdAt)),
      privacy: post.privacy,
      isBookmarked,
      originalPost: post.originalPost,
      likes: Number(post?.totalReactionsCount),
      comments: {
        total: Number(post.totalCommentsCount),
      },
      shares: post.share,
      image: post.media,
      location: post.location,
      ...reactions(currentPostReactions ?? [], currentUserId)
    }
  })

  return formattedPosts;
};

export const formatComments = (comments: any[], currentUserId: number) => {

  const plainComments = comments?.map(post => post.get({ plain: true }));

  const commentPreview = plainComments?.map((comment: CommentsEntity) => {

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

  return commentPreview

}


export const formatConversations = (conversations: any[]) => {

  const plainConversations = conversations?.map(conversation => conversation.get({ plain: true })) as ConversationData[];

  const data = plainConversations?.map((participant) => {
    if (!participant.conversation) return null

    const conversation = participant.conversation

    let displayName = conversation.name
    let avatar = null
    let unreadCount = 0
    if (conversation.type === 'private' && conversation.participants && conversation?.participants?.length > 0) {
      const otherParticipant = conversation.participants[0].user
      displayName = otherParticipant.full_name
      avatar = otherParticipant.avatar
      unreadCount = conversation.participants[0].unread_count
    }

    return {
      id: conversation.id,
      type: conversation.type,
      name: displayName,
      time: formatTimeAgo(new Date(conversation?.lastMessage?.sent_at), true),
      avatar,
      lastMessage: conversation.lastMessage ? {
        id: conversation.lastMessage.id,
        sender: conversation.lastMessage.sender ? {
          id: conversation.lastMessage.sender.id,
          username: conversation.lastMessage.sender.username,
          full_name: conversation.lastMessage.sender.full_name,
          avatar: conversation.lastMessage.sender.avatar,
        } : null,
        content: conversation.lastMessage.content,
        type: conversation.lastMessage.type,
        sent_at: conversation.lastMessage.sent_at,
      } : null,
      unreadCount,
      isMuted: participant.is_muted,
    };
  })

  return data?.filter(Boolean)
}