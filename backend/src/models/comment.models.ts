import { Model, DataTypes } from "sequelize";
import sequelize from "@/config/db";

class Comment extends Model {
  public id!: number;
  public userId!: number;
  public postId!: number;
  public parentId!: number;
  public createdAt!: string
  public isEdited!: boolean
  public content!: string
  public user!: {
    id: number;
    full_name: string;
    username: string;
    avatar: string | null;
  };
  public replies!: [
    {
      id: number,
      content: string,
      isEdited: boolean,
      createdAt: string
      user: {
        id: number;
        full_name: string;
        username: string;
        avatar: string | null;
      }
    }
  ]
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: DataTypes.INTEGER,
    postId: DataTypes.INTEGER,
    isEdited: DataTypes.BOOLEAN,
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      onDelete: 'CASCADE'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "comments",
    modelName: "Comment",
    timestamps: true,
  }
);

export default Comment;
