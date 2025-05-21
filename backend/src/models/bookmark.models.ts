import { DataTypes, Model} from 'sequelize'
import sequelize from '@/config/db'

class BookmarkPost extends Model{
    public id!: number
    public postId!:number
    public userId!:number
    public createdAt!: Date
    public updatedAt!: Date
}

BookmarkPost.init(
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        postId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'bookmarks_posts',
        modelName: 'BookmarkPost',
        timestamps: true

    }
)

export default BookmarkPost