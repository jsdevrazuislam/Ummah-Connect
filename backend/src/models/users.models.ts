import { DataTypes, Model } from 'sequelize'
import sequelize from '@/config/db'


class User extends Model {
  public id!: number;
  public username!: string;
  public full_name!: string;
  public avatar!: string;
  public location!: string;
  public website!: string;
  public role!: string;
  public title!: string;
  public email!: string;
  public refresh_token!: string;
  public password!: string;
  public is_verified!: boolean;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM('user', 'admin', 'super-admin'),
            defaultValue: 'user'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true
        },
        refresh_token: DataTypes.STRING,
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true
    }
)

export default User
