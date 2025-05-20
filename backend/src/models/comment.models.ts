import { Model, DataTypes } from "sequelize";
import sequelize from "@/config/db";

class Comment extends Model {
  public id!: number;
  public userId!: number;
  public postId!: number;
  public parentId!: number;
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
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
