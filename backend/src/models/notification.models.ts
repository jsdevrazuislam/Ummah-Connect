import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

export enum NotificationType {
  FOLLOW = "follow",
  LIKE = "like",
  COMMENT = "comment",
  REPLY = "reply",
  BOOKMARK = "bookmark",
  MENTION = "mention",
  SHORT_LIKE = "shortLike",
}

export class Notification extends Model {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public postId?: number;
  public type!: NotificationType;
  public message!: string;
  public icon!: string;
  public isRead!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    modelName: "Notification",
    timestamps: true,
  },
);

export default Notification;
