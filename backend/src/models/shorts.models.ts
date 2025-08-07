import { DataTypes, Model } from "sequelize";

import type BookmarkPost from "@/models/bookmark.models";
import type Reaction from "@/models/react.models";

import sequelize from "@/config/db";

class Short extends Model {
  public id!: number;
  public userId!: number;
  public videoId!: string;
  public description!: string;
  public thumbnailUrl!: string;
  public isPublic!: boolean;
  public share!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public reactions!: Reaction[];
  public bookmarks!: BookmarkPost[];
}

Short.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    videoId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    share: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "shorts",
    modelName: "Short",
    timestamps: true,
  },
);

export default Short;
