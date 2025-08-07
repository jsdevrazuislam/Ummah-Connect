import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class Message extends Model {
  public id!: number;
  public conversationId!: number;
  public senderId!: number;
  public content!: string;
  public keyForRecipient!: string;
  public keyForSender!: string;
  public parentMessageId!: number;
  public sentAt!: Date;
  public isDeleted!: boolean;
  public isUpdated!: boolean;
  public deletedById!: number | null;
  public deletedAt!: Date | null;
  readonly statuses!: [];
  public createdAt!: Date;
  public updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversationId: {
      type: DataTypes.INTEGER,
      references: {
        model: "conversations",
        key: "id",
      },
      allowNull: false,
      onDelete: "CASCADE",
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    keyForRecipient: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    keyForSender: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentMessageId: {
      type: DataTypes.INTEGER,
      references: {
        model: "messages",
        key: "id",
      },
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isDeleted: DataTypes.BOOLEAN,
    isUpdated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "messages",
    modelName: "Message",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["conversationId", "createdAt"],
      },
    ],
  },
);

export default Message;
