import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class MessageReaction extends Model {
  public id!: number;
  public messageId!: number;
  public userId!: number;
  public emoji!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

MessageReaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "messages",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "MessageReaction",
    tableName: "message_reactions",
    timestamps: true,
  },
);

export default MessageReaction;
