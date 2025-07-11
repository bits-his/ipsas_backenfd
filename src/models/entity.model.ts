import { DataTypes, type Association } from "sequelize"
import { BaseModel, type BaseAttributes, type BaseCreationAttributes } from "./base.model"
import { EntityType } from "../types/ipsas.types"

export interface EntityAttributes extends BaseAttributes {
  entityCode: string
  entityName: string
  entityType: EntityType
  parentEntityId?: string
  fiscalYearEnd: string
  currencyCode: string
  isActive: boolean
  description?: string
}

export interface EntityCreationAttributes extends BaseCreationAttributes {
  entityCode: string
  entityName: string
  entityType: EntityType
  parentEntityId?: string
  fiscalYearEnd: string
  currencyCode: string
  isActive?: boolean
  description?: string
}

export class Entity extends BaseModel<EntityAttributes, EntityCreationAttributes> {
  public entityCode!: string
  public entityName!: string
  public entityType!: EntityType
  public parentEntityId?: string
  public fiscalYearEnd!: string
  public currencyCode!: string
  public isActive!: boolean
  public description?: string

  // Associations
  public static associations: {
    parent: Association<Entity, Entity>
    children: Association<Entity, Entity>
  }
}

Entity.init(
  {
    ...BaseModel.initBaseModel("entities"),
    entityCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 20],
      },
    },
    entityName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    entityType: {
      type: DataTypes.ENUM(...Object.values(EntityType)),
      allowNull: false,
    },
    parentEntityId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "entities",
        key: "id",
      },
    },
    fiscalYearEnd: {
      type: DataTypes.STRING(5), // MM-DD format
      allowNull: false,
      validate: {
        is: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
      },
    },
    currencyCode: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        len: [3, 3],
        isUppercase: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...BaseModel.getBaseOptions("entities"),
    indexes: [
      ...BaseModel.getBaseOptions("entities").indexes,
      {
        unique: true,
        fields: ["entity_code"],
      },
      {
        fields: ["entity_type"],
      },
      {
        fields: ["parent_entity_id"],
      },
      {
        fields: ["is_active"],
      },
    ],
  },
)

// Define associations
Entity.belongsTo(Entity, {
  as: "parent",
  foreignKey: "parentEntityId",
})

Entity.hasMany(Entity, {
  as: "children",
  foreignKey: "parentEntityId",
})
