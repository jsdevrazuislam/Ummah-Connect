import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class Otp extends Model {
  public id!: number;
  public userId!: number;
  public otp!: number;
  public otpExpire!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    otpExpire: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "otps",
    modelName: "Otp",
    timestamps: true,
  },
);

export default Otp;
