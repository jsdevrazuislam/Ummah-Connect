import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class LiveStream extends Model {
  public id!: number;
  public userId!: number;
  public title!: string;
  public description!: string;
  public category!: string;
  public tags!: string[];
  public saveRecording!: boolean;
  public enableChat!: boolean;
  public notifyFollowers!: boolean;
  public roomName!: string;
  public isActive!: boolean;
  public startedAt!: Date;
  public endedAt!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

LiveStream.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    enableChat: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    saveRecording: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notifyFollowers: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    roomName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    startedAt: DataTypes.DATE,
    endedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "LiveStream",
    tableName: "live_streams",
    timestamps: true,
  },
);

export default LiveStream;
