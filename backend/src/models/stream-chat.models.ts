import { DataTypes, Model } from "sequelize";
import sequelize from "@/config/db";

class StreamChatConversation extends Model {
  public id!: number;
  public stream_id!: number;
  public sender_id!: number;
  public content!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

StreamChatConversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    stream_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "live_streams",
        key: "id",
      },
      allowNull: false,
      onDelete: "CASCADE",
    },
    sender_id: {
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
  }
);

export default StreamChatConversation;
