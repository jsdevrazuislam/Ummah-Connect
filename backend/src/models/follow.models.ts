import { DataTypes, Model } from 'sequelize'
import sequelize from '@/config/db'

class Follow extends Model {
    public followerId!: number;
    public followingId!: number;
}


Follow.init(
    {
        followerId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        followingId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    },
    {
        sequelize,
        modelName: 'Follow',
        tableName: 'follows',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['followerId', 'followingId']
            }
        ]
    }
)

export default Follow