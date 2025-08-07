import BookmarkPost from "@/models/bookmark.models";
import Comment from "@/models/comment.models";
import ConversationParticipant from "@/models/conversation-participant.modes";
import Conversation from "@/models/conversation.models";
import Follow from "@/models/follow.models";
import LiveStreamBan from "@/models/livestream-ban-models";
import MessageAttachment from "@/models/message-attachment.models";
import MessageReaction from "@/models/message-reaction.models";
import MessageStatus from "@/models/message-status.models";
import Message from "@/models/messages.models";
import Notification from "@/models/notification.models";
import Otp from "@/models/otp.models";
import Post from "@/models/post.models";
import Reaction from "@/models/react.models";
import RecoveryCodes from "@/models/recoverycodes.models";
import Report from "@/models/report.models";
import Shorts from "@/models/shorts.models";
import Story from "@/models/story.models";
import StreamChatConversation from "@/models/stream-chat.models";
import LiveStream from "@/models/stream.models";
import User from "@/models/users.models";

// follows associations
User.belongsToMany(User, {
  through: Follow,
  as: "Followers",
  foreignKey: "followingId",
  otherKey: "followerId",
});

User.belongsToMany(User, {
  through: Follow,
  as: "Following",
  foreignKey: "followerId",
  otherKey: "followingId",
});

// Post model
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId" });
Post.belongsTo(User, { foreignKey: "authorId", as: "user" });
User.hasMany(Post, { foreignKey: "authorId" });
Post.belongsTo(Post, { as: "originalPost", foreignKey: "sharedPostId" });
Post.hasMany(Post, { as: "shares", foreignKey: "sharedPostId" });

// Comment model (self-referencing for replies)
Comment.hasMany(Comment, { as: "replies", foreignKey: "parentId" });
Comment.belongsTo(Comment, { as: "parent", foreignKey: "parentId" });
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Comment, { foreignKey: "userId" });

// Reaction associations
Post.hasMany(Reaction, { foreignKey: "postId", as: "reactions" });
Comment.hasMany(Reaction, { foreignKey: "commentId", as: "reactions" });
Reaction.belongsTo(Post);
Reaction.belongsTo(Comment);
Reaction.belongsTo(Post, { as: "post", foreignKey: "postId" });

// Bookmark associations
Post.hasMany(BookmarkPost, { foreignKey: "postId", as: "bookmarks" });
BookmarkPost.belongsTo(Post, { foreignKey: "postId", as: "post" });
User.hasMany(BookmarkPost, { foreignKey: "userId" });
BookmarkPost.belongsTo(User, { foreignKey: "userId" });

// Recovery Codes Association
User.hasMany(RecoveryCodes, { foreignKey: "userId", as: "recoveryCodes" });
RecoveryCodes.belongsTo(User, { foreignKey: "userId" });

// Conversation Associations
User.hasMany(Conversation, { foreignKey: "createdBy", as: "createdConversations" });
Conversation.hasMany(ConversationParticipant, { foreignKey: "conversationId", as: "participants" });
ConversationParticipant.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });
User.hasMany(ConversationParticipant, { foreignKey: "userId", as: "conversationParticipants" });
ConversationParticipant.belongsTo(User, { foreignKey: "userId", as: "user" });
Conversation.belongsTo(Message, { foreignKey: "lastMessageId", as: "lastMessage" });

// Message Association
User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.hasMany(MessageReaction, { foreignKey: "messageId", as: "reactions" });
MessageReaction.belongsTo(Message, { foreignKey: "messageId" });
MessageReaction.belongsTo(User, { foreignKey: "userId", as: "reactedUser" });
Message.belongsTo(Message, {
  as: "parentMessage",
  foreignKey: "parentMessageId",
});

Message.hasMany(MessageStatus, { foreignKey: "messageId", as: "statuses" });
MessageStatus.belongsTo(Message, { foreignKey: "messageId" });

User.hasMany(MessageStatus, { foreignKey: "userId", as: "messageStatuses" });
MessageStatus.belongsTo(User, { foreignKey: "userId", as: "user" });

Message.hasMany(MessageAttachment, {
  foreignKey: "messageId",
  as: "attachments",
});

MessageAttachment.belongsTo(Message, {
  foreignKey: "messageId",
});

LiveStream.belongsTo(User, { foreignKey: "userId", as: "user" });

StreamChatConversation.belongsTo(User, { foreignKey: "senderId", as: "sender" });
StreamChatConversation.belongsTo(LiveStream, { foreignKey: "streamId", as: "stream" });

Report.belongsTo(User, { foreignKey: "reporterId", as: "reporter" });

Shorts.belongsTo(User, { foreignKey: "userId", as: "user" });
Comment.belongsTo(Shorts, { foreignKey: "postId" });
Reaction.belongsTo(Shorts, { foreignKey: "postId" });
Shorts.hasMany(Reaction, { foreignKey: "postId", as: "reactions" });
Shorts.hasMany(BookmarkPost, { foreignKey: "postId", as: "bookmarks" });

Notification.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Notification.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

User.hasMany(Story, { foreignKey: "userId", as: "stories" });
Story.belongsTo(User, { foreignKey: "userId", as: "user" });

export { Comment, Conversation, ConversationParticipant, Follow, LiveStream, LiveStreamBan, Message, MessageReaction, MessageStatus, Notification, Otp, Post, Reaction, RecoveryCodes, Report, Shorts, Story, StreamChatConversation, User };
export default { User, Follow, Post, Reaction, Comment, RecoveryCodes, Otp, Conversation, ConversationParticipant, Message, MessageReaction, MessageStatus, LiveStream, StreamChatConversation, Report, LiveStreamBan, Shorts, Notification, Story };
