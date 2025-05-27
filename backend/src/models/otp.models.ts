import { DataTypes, Model} from 'sequelize'
import sequelize from '@/config/db'


class Otp extends Model{
    public id!: number
    public user_id!:number
    public otp!: number
    public otp_expire!: Date
    public createdAt!: Date
    public updatedAt!: Date
}


Otp.init(
    {
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id:{
            type: DataTypes.INTEGER,
            references:{
                model:"users",
                key:"id"
            },
            allowNull: false
        },
        otp:{
            type:DataTypes.INTEGER,
            allowNull: false
        },
        otp_expire:{
            type:DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName:'otps',
        modelName: 'Otp',
        timestamps: true
    }
)

export default Otp