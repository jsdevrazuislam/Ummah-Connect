import { DataTypes, Model} from 'sequelize'
import sequelize from '@/config/db';

class CommentReaction extends Model {
    public userId!: number;
    public commentId!: number;
    public react_type!: string;
    public icon!: string;
}

CommentReaction.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    react_type: {
      type: DataTypes.ENUM('love', 'care', 'sad', 'like', 'haha', 'wow', 'angry'),
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "CommentReaction",
    tableName: 'comment_reactions',
    timestamps: true
  }
);

export default CommentReaction