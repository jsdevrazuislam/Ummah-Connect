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

// Bookmark associations
Post.hasMany(BookmarkPost, {foreignKey:'postId', as: 'bookmarks'})
BookmarkPost.belongsTo(Post, {foreignKey:'postId' })
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





export { User, Follow, Post, Reaction, Comment, RecoveryCodes, Otp, Conversation, ConversationParticipant, Message, MessageReaction };
export default { User, Follow, Post, Reaction, Comment, RecoveryCodes, Otp,  Conversation, ConversationParticipant, Message, MessageReaction };
