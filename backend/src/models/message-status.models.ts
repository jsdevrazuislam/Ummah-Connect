import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class MessageStatus extends Model {
  public id!: number;
  public messageId!: number;
  public userId!: number;
  public status!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

MessageStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      references: {
        model: "messages",
        key: "id",
      },
      allowNull: false,
      onDelete: "CASCADE",
    },

    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
      onDelete: "CASCADE",
    },

    status: {
      type: DataTypes.ENUM("sent", "delivered", "seen"),
      defaultValue: "sent",
    },

  },
  {
    sequelize,
    modelName: "MessageStatus",
    tableName: "message_status",
    timestamps: true,
  },
);

export default MessageStatus;
