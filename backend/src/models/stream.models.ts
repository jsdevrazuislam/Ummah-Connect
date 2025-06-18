import { Model, DataTypes } from "sequelize";
import sequelize from "@/config/db"; 

class LiveStream extends Model {
    public id!:number
    public user_id!:number
    public title!:string
    public description!:string
    public category!:string
    public tags!:string[]
    public save_recording!:boolean
    public enable_chat!:boolean
    public notify_followers!:boolean
    public room_name!:string
    public is_active!:boolean
    public started_at!:Date
    public ended_at!:Date
    public created_at!:Date
    public updated_at!:Date

}

LiveStream.init(
  {
    id:{
        type:DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING), 
      defaultValue: [],
    },
    enable_chat: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    save_recording: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notify_followers: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    room_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    started_at: DataTypes.DATE,
    ended_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "LiveStream",
    tableName: "live_streams",
    timestamps: true,
  }
);

export default LiveStream;
