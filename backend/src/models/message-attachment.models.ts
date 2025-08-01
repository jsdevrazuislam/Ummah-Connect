import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class MessageAttachment extends Model {
  public id!: number;
  public messageId!: number;
  public fileUrl!: string;
  public fileType!: "image" | "video" | "audio" | "pdf" | "doc";
  public thumbnailUrl?: string;
  public duration?: number;
  public sizeInBytes?: number;
  public metadata?: Record<string, string>;
  public createdAt!: Date;
  public updatedAt!: Date;
}

MessageAttachment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.ENUM("image", "video", "audio", "pdf", "doc", "text"),
      defaultValue: "text",
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sizeInBytes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: "message_attachment",
    modelName: "MessageAttachment",
    timestamps: true,
  },
);

export default MessageAttachment;
