import { DataTypes, Model} from 'sequelize'
import sequelize from '@/config/db'

class Conversation extends Model{
    public id!: number
    public type!:string
    public name!: string
    public created_by!: number
    public last_message_id!:number
    public createdAt!:Date
    public updatedAt!:Date
}


Conversation.init(
    {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        type:{
            type:DataTypes.ENUM('private', 'group'),
            defaultValue: 'private'
        },
        name:DataTypes.STRING,
        created_by:{
            type:DataTypes.INTEGER,
            references:{
                model:"users",
                key:"id"
            },
            allowNull: true
        },
        user_pair_key:{
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        last_message_id:{
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "messages",
                key: "id"
            },
            onDelete: 'CASCADE'
        }

    },
    {
        sequelize,
        tableName: 'conversations',
        modelName:"Conversation",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['user_pair_key', 'type']
            }
        ]
    }
)

export default Conversation