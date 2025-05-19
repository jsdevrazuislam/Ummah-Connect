import Follow from '@/models/follow.models'
import User from '@/models/users.models'

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

export { User, Follow };
export default { User, Follow };
