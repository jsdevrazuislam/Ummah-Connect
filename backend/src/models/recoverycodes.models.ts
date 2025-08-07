import { DataTypes, Model } from "sequelize";

import sequelize from "@/config/db";

class RecoveryCodes extends Model {
  public id!: number;
  public userId!: number;
  public codeHash!: string;
  public used!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

RecoveryCodes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    codeHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "recovery_codes",
    modelName: "RecoveryCodes",
    timestamps: true,
  },
);

export default RecoveryCodes;
