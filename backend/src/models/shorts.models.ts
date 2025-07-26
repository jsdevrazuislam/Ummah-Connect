import { DataTypes, Model } from "sequelize";
import sequelize from "@/config/db";
import Reaction from "@/models/react.models";
import BookmarkPost from "@/models/bookmark.models";

class Short extends Model {
  public id!: number;
  public userId!: number;
  public video_id!: string;
  public description!: string;
  public thumbnail_url!: string;
  public is_public!: boolean;
  public share!: number
  public createdAt!: Date;
  public updatedAt!: Date;
  public reactions!: Reaction[]
  public bookmarks!: BookmarkPost[]
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
    video_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
     share: {
      type: DataTypes.INTEGER,
      defaultValue: 0
     },
  },
  {
    sequelize,
    tableName: "shorts",
    modelName: "Short",
    timestamps: true
  }
);

export default Short;
