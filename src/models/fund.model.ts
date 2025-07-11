import { DataTypes, type Association } from "sequelize"
import { BaseModel, type BaseAttributes, type BaseCreationAttributes } from "./base.model"
import { FundType } from "../types/ipsas.types"
import { Entity } from "./entity.model"

export interface FundAttributes extends BaseAttributes {
  fundCode: string
  fundName: string
  fundType: FundType
  entityId: string
  description?: string
  isActive: boolean
  budgetAuthority?: number
  carryForwardAllowed: boolean
}

export interface FundCreationAttributes extends BaseCreationAttributes {
  fundCode: string
  fundName: string
  fundType: FundType
  entityId: string
  description?: string
  isActive?: boolean
  budgetAuthority?: number
  carryForwardAllowed?: boolean
}

export class Fund extends BaseModel<FundAttributes, FundCreationAttributes> {
  public fundCode!: string
  public fundName!: string
  public fundType!: FundType
  public entityId!: string
  public description?: string
  public isActive!: boolean
  public budgetAuthority?: number
  public carryForwardAllowed!: boolean

  // Associations
  public Entity?: Entity

  public static associations: {
    entity: Association<Fund, Entity>
  }
}

Fund.init(
  {
    ...BaseModel.initBaseModel("funds"),
    fundCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 20],
      },
    },
    fundName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    fundType: {
      type: DataTypes.ENUM(...Object.values(FundType)),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "entities",
        key: "id",
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    budgetAuthority: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    carryForwardAllowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    ...BaseModel.getBaseOptions("funds"),
    indexes: [
      ...BaseModel.getBaseOptions("funds").indexes,
      {
        unique: true,
        fields: ["fund_code", "entity_id"],
      },
      {
        fields: ["fund_type"],
      },
      {
        fields: ["entity_id"],
      },
      {
        fields: ["is_active"],
      },
    ],
  },
)

// Define associations
Fund.belongsTo(Entity, {
  as: "entity",
  foreignKey: "entityId",
})
