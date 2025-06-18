import { DataTypes, Model } from "sequelize";
import sequelize from "@/config/db";

class LiveStreamBan extends Model {
  public id!: number;
  public stream_id!: number;
  public banned_user_id!: number;
  public banned_by_id!: number;
  public reason!: string;
  public ban_duration!: number | null; 
  public createdAt!: Date; 
}

LiveStreamBan.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    stream_id: { type: DataTypes.INTEGER, allowNull: false },
    banned_user_id: { type: DataTypes.INTEGER, allowNull: false },
    banned_by_id: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT },
    ban_duration: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "live_stream_bans", timestamps: true, modelName:'LiveStreamBan' }
);


export default LiveStreamBan