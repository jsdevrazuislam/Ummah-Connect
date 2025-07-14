import { Model, DataTypes } from 'sequelize'
import sequelize from '@/config/db'

class Reaction extends Model {
    public userId!: number
    public postId!: number
    public react_type!: string
    public icon!: string
}

Reaction.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            onDelete: 'CASCADE'
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            onDelete: 'CASCADE'
        },
        commentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            onDelete: 'CASCADE'
        },
        react_type: {
            type: DataTypes.ENUM('love', 'care', 'sad', 'like', 'haha', 'wow', 'angry'),
            allowNull: true
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: "Reaction",
        tableName: 'reactions',
        timestamps: true
    }
)

export default Reaction