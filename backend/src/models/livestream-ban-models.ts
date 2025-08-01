import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class LiveStreamBan extends Model {
  public id!: number;
  public streamId!: number;
  public bannedUserId!: number;
  public bannedById!: number;
  public reason!: string;
  public banDuration!: number | null;
  public createdAt!: Date;
}

LiveStreamBan.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    streamId: { type: DataTypes.INTEGER, allowNull: false },
    bannedUserId: { type: DataTypes.INTEGER, allowNull: false },
    bannedById: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT },
    banDuration: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "live_stream_bans", timestamps: true, modelName: "LiveStreamBan" },
);

export default LiveStreamBan;
