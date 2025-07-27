import { DataTypes, Model} from 'sequelize'
import sequelize from '@/config/db'


class Message extends Model{
    public id!:number
    public conversation_id!:number
    public sender_id!:number
    public content!: string
    public key_for_recipient!: string
    public key_for_sender!: string
    public parent_message_id!:number
    public sent_at!: Date
    public is_deleted!: boolean
    public deleted_by_id!: number
    public deleted_at!: Date
    public createdAt!: Date
    public updatedAt!: Date
}

Message.init(
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conversation_id:{
            type: DataTypes.INTEGER,
            references:{
                model:"conversations",
                key:"id"
            },
            allowNull: false,
            onDelete:"CASCADE"
        },
        sender_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model:'users',
                key:"id"
            }
        },
        content:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        key_for_recipient:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        key_for_sender:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        parent_message_id:{
            type: DataTypes.INTEGER,
            references:{
                model:"messages",
                key:"id"
            },
            allowNull: true
        },
        sent_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_deleted: DataTypes.BOOLEAN,
        deleted_by_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references:{
                model:"users",
                key:"id"
            }
        },
        deleted_at:  {
            type: DataTypes.DATE,
            allowNull: true
        },
    },
    {
        sequelize,
        tableName:'messages',
        modelName:"Message",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['conversation_id', 'createdAt']
            }
        ]
    }
)

export default Message