import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class ConversationParticipant extends Model {
  public id!: number;
  public conversationId!: number;
  public userId!: number;
  public unreadCount!: number;
  public lastReadMessageId!: number;
  public joinedAt!: Date;
  public leftAt!: Date;
  public isAdmin!: boolean;
  public isMuted!: boolean;
  public isArchived!: boolean;
  public isBlocked!: boolean;
}

ConversationParticipant.init(
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    unreadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastReadMessageId: {
      type: DataTypes.INTEGER,
      references: {
        model: "messages",
        key: "id",
      },
      allowNull: true,
      onDelete: "SET NULL",
    },
    joinedAt: DataTypes.DATE,
    leftAt: DataTypes.DATE,
    isAdmin: DataTypes.BOOLEAN,
    isMuted: DataTypes.BOOLEAN,
    isArchived: DataTypes.BOOLEAN,
    isBlocked: DataTypes.BOOLEAN,
  },
  {
    sequelize,
    modelName: "ConversationParticipant",
    tableName: "conversationparticipants",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "conversationId"],
      },
    ],
  },
);

export default ConversationParticipant;
