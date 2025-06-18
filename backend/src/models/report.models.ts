import { DataTypes, Model } from 'sequelize'
import sequelize from '@/config/db'


class Report extends Model {
    public id!: number
    public type!: string
    public reason!: string
    public stream_id!: number
    public reported_id!: number
    public reporter_id!: number
    public attachments!: string[]
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
        reported_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "ID of the reported item (postId, userId, messageId, etc)",
        },
        stream_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "Only for live stream spamming",
        },
        reporter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        attachments:{
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: []
        }
    },
    {
        sequelize,
        timestamps: true,
        modelName: 'Report',
        tableName: 'reports'
    }
)

export default Report