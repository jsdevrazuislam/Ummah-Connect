import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class Conversation extends Model {
  public id!: number;
  public type!: string;
  public name!: string;
  public userPairKey!: string;
  public createdBy!: number;
  public lastMessageId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("private", "group"),
      defaultValue: "private",
    },
    name: DataTypes.STRING,
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: true,
    },
    userPairKey: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    lastMessageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "messages",
        key: "id",
      },
      onDelete: "CASCADE",
    },

  },
  {
    sequelize,
    tableName: "conversations",
    modelName: "Conversation",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userPairKey", "type"],
      },
    ],
  },
);

export default Conversation;
