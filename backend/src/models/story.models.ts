import { DataTypes, Model } from "sequelize";
import sequelize from "@/config/db";

class Story extends Model {
  public id!: number;
  public userId!: number;
  public mediaUrl!: string;
  public caption?: string;
  public type?: string;
  public textColor?: string;
  public background?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Story.init(
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
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caption: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'image'
    },
    background: {
      type: DataTypes.STRING,
    },
    textColor: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "Story",
    tableName: "stories",
    timestamps: true,
  }
);

export default Story