import Follow from '@/models/follow.models'
import User from '@/models/users.models'
import Post from '@/models/post.models'
import Reaction from '@/models/react.models'
import Comment from '@/models/comment.models'
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

// Post model
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Post.belongsTo(User, { foreignKey: 'authorId', as:'user' });
User.hasMany(Post, { foreignKey: 'authorId' });


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

Post.hasMany(BookmarkPost, {foreignKey:'postId', as: 'bookmarks'})
BookmarkPost.belongsTo(Post, {foreignKey:'postId' })

User.hasMany(BookmarkPost, { foreignKey: 'userId' });
BookmarkPost.belongsTo(User, { foreignKey: 'userId' });


export { User, Follow, Post, Reaction, Comment };
export default { User, Follow, Post, Reaction, Comment };
