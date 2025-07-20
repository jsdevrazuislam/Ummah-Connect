import Follow from '@/models/follow.models'
import User from '@/models/users.models'
import Post from '@/models/post.models'
import Reaction from '@/models/react.models'
import Comment from '@/models/comment.models'
import BookmarkPost from '@/models/bookmark.models'
import RecoveryCodes from '@/models/recoverycodes.models'
import Otp from '@/models/otp.models'
import Conversation from '@/models/conversation.models'
import ConversationParticipant from '@/models/conversation-participant.modes'
import Message from '@/models/messages.models'
import MessageReaction from '@/models/message-reaction.models'
import MessageStatus from '@/models/message-status.models'
import MessageAttachment from '@/models/message-attachment.models'
import LiveStream from '@/models/stream.models'
import StreamChatConversation from '@/models/stream-chat.models'
import Report from '@/models/report.models'
import LiveStreamBan from '@/models/livestream-ban-models'
import Shorts from '@/models/shorts.models'
import Notification from '@/models/notification.models'

// follows associations
User.belongsToMany(User, {
  through: Follow,
  as: 'Followers',
  foreignKey: 'followingId',
  otherKey: 'followerId',
});

User.belongsToMany(User, {
  through: Follow,
  as: 'Following',
  foreignKey: 'followerId',
  otherKey: 'followingId',
});

// Post model
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Post.belongsTo(User, { foreignKey: 'authorId', as:'user' });
User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(Post, { as: 'originalPost', foreignKey: 'sharedPostId' });
Post.hasMany(Post, { as: 'shares', foreignKey: 'sharedPostId' });


// Comment model (self-referencing for replies)
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Comment, { foreignKey: 'userId' });


// Reaction associations
Post.hasMany(Reaction, { foreignKey: 'postId', as: 'reactions'});
Comment.hasMany(Reaction, { foreignKey: 'commentId', as: 'reactions' });
Reaction.belongsTo(Post);
Reaction.belongsTo(Comment);
Reaction.belongsTo(Post, { as: "post", foreignKey: "postId" });


// Bookmark associations
Post.hasMany(BookmarkPost, {foreignKey:'postId', as: 'bookmarks'})
BookmarkPost.belongsTo(Post, {foreignKey:'postId', as:'post' })
User.hasMany(BookmarkPost, { foreignKey: 'userId' });
BookmarkPost.belongsTo(User, { foreignKey: 'userId' });

// Recovery Codes Association
User.hasMany(RecoveryCodes, { foreignKey: 'user_id', as: 'recoveryCodes' });
RecoveryCodes.belongsTo(User, { foreignKey: 'user_id' });

// Conversation Associations
User.hasMany(Conversation, { foreignKey: 'created_by', as: 'createdConversations'})
Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversation_id', as: 'participants' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversation_id', as:'conversation' });
User.hasMany(ConversationParticipant, { foreignKey: 'user_id', as: 'conversationParticipants' });
ConversationParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Conversation.belongsTo(Message, { foreignKey: 'last_message_id', as: 'lastMessage' });


// Message Association
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.hasMany(MessageReaction, { foreignKey: 'message_id', as: 'reactions' });
MessageReaction.belongsTo(Message, { foreignKey: 'message_id' });
MessageReaction.belongsTo(User, { foreignKey: 'user_id', as: 'reactedUser' });

Message.hasMany(MessageStatus, { foreignKey: 'message_id', as: 'statuses' });
MessageStatus.belongsTo(Message, { foreignKey: 'message_id' });

User.hasMany(MessageStatus, { foreignKey: 'user_id', as: 'messageStatuses' });
MessageStatus.belongsTo(User, { foreignKey: 'user_id', as:'user' });

Message.hasMany(MessageAttachment, {
  foreignKey: 'message_id',
  as: 'attachments'
});

MessageAttachment.belongsTo(Message, {
  foreignKey: 'message_id'
});

LiveStream.belongsTo(User, { foreignKey: 'user_id', as:'user'})

StreamChatConversation.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
StreamChatConversation.belongsTo(LiveStream, { foreignKey: "stream_id", as: "stream" });

Report.belongsTo(User, { foreignKey: "reporter_id", as: "reporter" });


Shorts.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Shorts, { foreignKey: 'postId' });
Reaction.belongsTo(Shorts, { foreignKey: 'postId' }); 
Shorts.hasMany(Reaction, { foreignKey: 'postId', as: 'reactions'});
Shorts.hasMany(BookmarkPost, {foreignKey:'postId', as: 'bookmarks'})


Notification.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Notification.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });

export { User, Follow, Post, Reaction, Comment, RecoveryCodes, Otp, Conversation, ConversationParticipant, Message, MessageReaction, MessageStatus, LiveStream, StreamChatConversation, Report, LiveStreamBan, Shorts, Notification};
export default { User, Follow, Post, Reaction, Comment, RecoveryCodes, Otp,  Conversation, ConversationParticipant, Message, MessageReaction, MessageStatus, LiveStream, StreamChatConversation, Report, LiveStreamBan, Shorts, Notification};
