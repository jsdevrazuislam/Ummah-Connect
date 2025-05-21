import { Model, DataTypes } from 'sequelize'
import sequelize from '@/config/db'

class Post extends Model{
    public id!: number
    public media!:string
    public content!:string
    public location!:string
    public privacy!:string
    public authorId!: string
    public share!: number
    public author!: {
        id: string
        full_name: string,
        username:string
        avatar: string
    }
    public createdAt!: Date
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
        share: DataTypes.INTEGER,
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