import { DataTypes, Model } from 'sequelize'
import sequelize from '@/config/db'
import RecoveryCodes from '@/models/recoverycodes.models';


class User extends Model {
    public id!: number;
    public username!: string;
    public full_name!: string;
    public avatar!: string;
    public cover!: string;
    public location!: string;
    public website!: string;
    public role!: string;
    public email!: string;
    public refresh_token!: string;
    public password!: string;
    public gender!: string;
    public bio!: string;
    public is_verified!: boolean;
    public privacy_settings!: object
    public notification_preferences!: object
    public is_two_factor_enabled!: boolean
    public two_factor_secret!: string
    public is_saved_backup_codes!:boolean
    public recoveryCodes!: RecoveryCodes[]
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
        bio: {
            type: DataTypes.STRING,
            allowNull: true
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true
        },
        cover: {
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
        gender: {
            type: DataTypes.ENUM('male', 'female'),
            defaultValue: 'male'
        },
        refresh_token: DataTypes.STRING,
        privacy_settings: {
            type: DataTypes.JSONB,
            defaultValue: {},
            allowNull: false,
        },
        notification_preferences: {
            type: DataTypes.JSONB,
            defaultValue: {},
            allowNull: false,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_two_factor_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        two_factor_secret: {
            type: DataTypes.STRING,
            allowNull: true
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
