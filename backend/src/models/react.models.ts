import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class Reaction extends Model {
  public userId!: number;
  public postId!: number;
  public shortId!: number;
  public reactType!: string;
  public icon!: string;
}

Reaction.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      onDelete: "CASCADE",
    },
    shortId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      onDelete: "CASCADE",
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      onDelete: "CASCADE",
    },
    reactType: {
      type: DataTypes.ENUM("love", "care", "sad", "like", "haha", "wow", "angry", ""),
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Reaction",
    tableName: "reactions",
    timestamps: true,
  },
);

export default Reaction;
