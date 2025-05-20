import { Model, DataTypes } from 'sequelize'
import sequelize from '@/config/db'

class Post extends Model{
    public id!: number
    public media!:string
    public content!:string
    public location!:string
    public privacy!:string
    public authorId!: string
}

Post.init(
    {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        media: DataTypes.STRING,
        content: DataTypes.STRING,
        location: DataTypes.STRING,
        privacy: {
            type: DataTypes.ENUM('public', 'friends', 'only me'),
            defaultValue: 'public'
        },
        authorId:{
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    },
    {
        sequelize,
        tableName: 'posts',
        modelName: 'Post',
        timestamps: true
    }
)

export default Post