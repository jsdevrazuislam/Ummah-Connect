import { DataTypes, Model} from 'sequelize'
import sequelize from '@/config/db'

class MessageReaction extends Model{
    public id!:number
    public message_id!:number
    public user_id!: number
    public emoji!:string
    public createdAt!: Date
    public updatedAt!: Date
}

MessageReaction.init(
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        message_id:{
            type:DataTypes.INTEGER,
            allowNull: false,
            references:{
                model:"messages",
                key:"id"
            }
        },
        user_id:{
            type:DataTypes.INTEGER,
            allowNull: false,
            references:{
                model:"users",
                key:"id"
            }
        },
        emoji:{
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'MessageReaction',
        tableName:"message_reactions",
        timestamps: true
    }
)

export default MessageReaction