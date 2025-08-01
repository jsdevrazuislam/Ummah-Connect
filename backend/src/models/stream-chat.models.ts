import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class StreamChatConversation extends Model {
  public id!: number;
  public streamId!: number;
  public senderId!: number;
  public content!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

StreamChatConversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    streamId: {
      type: DataTypes.INTEGER,
      references: {
        model: "live_streams",
        key: "id",
      },
      allowNull: false,
      onDelete: "CASCADE",
    },
    senderId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "StreamChatConversation",
    tableName: "stream_chats",
    timestamps: true,
  },
);

export default StreamChatConversation;
