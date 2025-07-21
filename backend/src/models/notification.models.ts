import { Model, DataTypes } from "sequelize";
import sequelize from "@/config/db";

export enum NotificationType {
  FOLLOW = "follow",
  LIKE = "like",
  COMMENT = "comment",
  REPLY = "reply",
  BOOKMARK = "bookmark",
  MENTION = "mention",
}

export class Notification extends Model {
  public id!: number;
  public sender_id!: number;
  public receiver_id!: number;
  public post_id?: number;
  public type!: NotificationType;
  public message!: string;
  public icon!: string;
  public is_read!: boolean;

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
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    post_id: {
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
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    modelName: "Notification",
    timestamps: true
  }
);

export default Notification