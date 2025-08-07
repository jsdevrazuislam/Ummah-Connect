import { DataTypes, Model } from "sequelize";

import type RecoveryCodes from "@/models/recoverycodes.models";

import sequelize from "@/config/db";

class User extends Model {
  public id!: number;
  public username!: string;
  public publicKey!: string;
  public fullName!: string;
  public avatar!: string;
  public cover!: string;
  public location!: string;
  public website!: string;
  public role!: string;
  public email!: string;
  public refreshToken!: string;
  public password!: string;
  public gender!: string;
  public bio!: string;
  public longitude!: number;
  public latitude!: number;
  public isVerified!: boolean;
  public verifiedIdentity!: boolean;
  public privacySettings!: {
    message: string;
  };

  public notificationPreferences!: object;
  public isTwoFactorEnabled!: boolean;
  public twoFactorSecret!: string;
  public recoveryCodes!: RecoveryCodes[];
  public lastSeenAt!: Date;
  public deletedAt!: Date;
  public isDeleteAccount!: boolean;
  public interests!: string[];
  public dob!: string;
  public title!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cover: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDeleteAccount: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dob: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interests: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    publicKey: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "super-admin"),
      defaultValue: "user",
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      defaultValue: "male",
    },
    refreshToken: DataTypes.STRING,
    privacySettings: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: false,
    },
    notificationPreferences: {
      type: DataTypes.JSONB,
      defaultValue: {},
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verifiedIdentity: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isTwoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastSeenAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email", "username"],
      },
    ],
  },
);

export default User;
