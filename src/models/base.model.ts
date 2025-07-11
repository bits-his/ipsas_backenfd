import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../config/database"
import { v4 as uuidv4 } from "uuid"

export interface BaseAttributes {
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface BaseCreationAttributes extends Optional<BaseAttributes, "id" | "createdAt" | "updatedAt"> {}

export class BaseModel<T extends BaseAttributes, K extends BaseCreationAttributes> extends Model<T, K> {
  public id!: string
  public createdAt!: Date
  public updatedAt!: Date
  public deletedAt?: Date

  static initBaseModel(tableName: string, additionalAttributes: any = {}) {
    return {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      ...additionalAttributes,
    }
  }

  static getBaseOptions(tableName: string) {
    return {
      sequelize,
      tableName,
      paranoid: true, // Soft deletes
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ["created_at"],
        },
        {
          fields: ["updated_at"],
        },
      ],
    }
  }
}
