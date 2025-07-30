import { DataTypes, Model} from 'sequelize'
import sequelize from '@/config/db'

class ConversationParticipant extends Model{
    public id!:number
    public conversation_id!:number
    public user_id!:number
    public unread_count!: number
    public last_read_message_id!: number
    public joined_at!: Date
    public left_at!: Date
    public is_admin!: boolean
    public is_muted!: boolean
    public is_archived!:boolean
    public is_blocked!: boolean
}


ConversationParticipant.init(
    {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conversation_id:{
            type: DataTypes.INTEGER,
            references:{
                model:'conversations',
                key: 'id'
            },
            allowNull: false,
            onDelete: 'CASCADE'
        },
        user_id:{
            type:DataTypes.INTEGER,
            allowNull: false,
            references:{
                model:"users",
                key:"id"
            },
            onDelete: 'CASCADE'
        },
        unread_count:{
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        last_read_message_id:{
            type: DataTypes.INTEGER,
            references:{
                model:"messages",
                key:"id"
            },
            allowNull: true,
            onDelete: 'SET NULL'
        },
        joined_at: DataTypes.DATE,
        left_at: DataTypes.DATE,
        is_admin: DataTypes.BOOLEAN,
        is_muted: DataTypes.BOOLEAN,
        is_archived: DataTypes.BOOLEAN,
        is_blocked: DataTypes.BOOLEAN
    },
    {
        sequelize,
        modelName: 'ConversationParticipant',
        tableName:"conversationparticipants",
        timestamps: true,
        indexes:[
            {
                unique: true,
                fields: ['user_id', 'conversation_id']
            }
        ]
    }
)

export default ConversationParticipant