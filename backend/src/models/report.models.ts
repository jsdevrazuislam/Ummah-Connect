import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

export enum ReportType {
  POST = "post",
  USER = "user",
  MESSAGE = "message",
  STREAM = "stream",
  SPAMMING = "spamming",
  SHORTS = "shorts",
}

class Report extends Model {
  public id!: number;
  public type!: string;
  public reason!: string;
  public reportedId!: number;
  public reporterId!: number;
  public attachments!: string[];
}

Report.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("post", "user", "message", "stream", "spamming"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reportedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID of the reported item (postId, userId, messageId, etc)",
    },
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "Report",
    tableName: "reports",
  },
);

export default Report;
