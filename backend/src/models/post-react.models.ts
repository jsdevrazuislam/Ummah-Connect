import { Model, DataTypes } from 'sequelize'
import sequelize from '@/config/db'

class PostReaction extends Model {
    public userId!: number
    public postId!: number
    public react_type!: string
    public icon!: string
}

PostReaction.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        react_type: {
            type: DataTypes.ENUM('love', 'care', 'sad', 'like', 'haha', 'wow', 'angry'),
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "PostReaction",
        tableName: 'post_reactions',
        timestamps: true
    }
)

export default PostReaction