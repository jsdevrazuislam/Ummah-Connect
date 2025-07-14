import { Model, DataTypes } from 'sequelize'
import sequelize from '@/config/db'

class Post extends Model{
    public id!: number
    public media!:string
    public content!:string
    public contentType!:string
    public background!:string
    public location!:string
    public privacy!:string
    public authorId!: string
    public share!: number
    public sharedPostId!: number
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
        background: DataTypes.STRING,
        share: DataTypes.INTEGER,
        sharedPostId: {                  
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'posts', key: 'id' }
        },
        privacy: {
            type: DataTypes.ENUM('public', 'friends', 'only me'),
            defaultValue: 'public'
        },
        contentType: {
            type: DataTypes.ENUM('text', 'video', 'audio', 'picture'),
            defaultValue: 'text'
        },
        authorId:{
            type: DataTypes.INTEGER,
            allowNull: false
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