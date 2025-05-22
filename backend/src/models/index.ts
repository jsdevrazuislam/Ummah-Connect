import Follow from '@/models/follow.models'
import User from '@/models/users.models'
import Post from '@/models/post.models'
import PostReaction from '@/models/post-react.models'
import Comment from '@/models/comment.models'
import CommentReaction from '@/models/comment-react.models'
import BookmarkPost from '@/models/bookmark.models'

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

User.hasMany(Post, {
  foreignKey: 'authorId',
  as: 'posts'
});

Post.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});

Post.hasMany(PostReaction, {
  foreignKey: 'postId',
  as: 'reactions'
});

User.hasMany(PostReaction, {
  foreignKey: 'userId',
  as: 'userReactions'
});

PostReaction.belongsTo(User, {
  foreignKey: 'userId',
  as: "user"
});

Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments'
});

Comment.belongsTo(Post, {
  foreignKey: 'postId'
});

User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments'
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: "user"
});

Comment.hasMany(Comment, {
  foreignKey: 'parentId',
  as: 'replies'
});

Comment.belongsTo(Comment, {
  foreignKey: 'parentId',
  as: 'parent'
});

Comment.hasMany(CommentReaction, { foreignKey: 'commentId', as: 'reactions' });
CommentReaction.belongsTo(Comment, { foreignKey: 'commentId' });

User.hasMany(CommentReaction, { foreignKey: 'userId', as: 'user' });
CommentReaction.belongsTo(User, { foreignKey: 'userId', as:'user' });

Post.hasMany(BookmarkPost, {foreignKey:'postId', as: 'bookmarks'})
BookmarkPost.belongsTo(Post, {foreignKey:'postId' })

User.hasMany(BookmarkPost, { foreignKey: 'userId' });
BookmarkPost.belongsTo(User, { foreignKey: 'userId' });


export { User, Follow, Post, PostReaction, Comment };
export default { User, Follow, Post, PostReaction, Comment };
