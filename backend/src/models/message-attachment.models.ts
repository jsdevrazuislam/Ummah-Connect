import { DataTypes, Model } from 'sequelize'
import sequelize from '@/config/db'

class MessageAttachment extends Model {
  public id!: number;
  public message_id!: number;
  public file_url!: string;
  public file_type!: 'image' | 'video' | 'audio' | 'pdf' | 'doc';
  public thumbnail_url?: string;
  public duration?: number;
  public size_in_bytes?: number;
  public metadata?: Record<string, any>;
  public createdAt!: Date;
  public updatedAt!: Date;
}

MessageAttachment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "messages",
        key: "id"
      }
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_type: {
      type: DataTypes.ENUM('image', 'video', 'audio', 'pdf', 'doc', 'text'),
      defaultValue: 'text'
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    size_in_bytes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
  },
  {
    sequelize,
    tableName: 'message_attachment',
    modelName: "MessageAttachment",
    timestamps: true
  }
)

export default MessageAttachment