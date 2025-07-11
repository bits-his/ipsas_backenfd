import { DataTypes, type Association } from "sequelize"
import { BaseModel, type BaseAttributes, type BaseCreationAttributes } from "./base.model"
import { RevenueRecognitionBasis } from "../types/ipsas.types"
import { Entity } from "./entity.model"
import { Fund } from "./fund.model"
import { ChartOfAccounts } from "./chartOfAccounts.model"

export interface RevenueAttributes extends BaseAttributes {
  revenueCode: string
  revenueName: string
  revenueType: string
  entityId: string
  fundId: string
  accountId: string
  recognitionBasis: RevenueRecognitionBasis
  fiscalYear: number
  budgetedAmount: number
  actualAmount: number
  collectedAmount: number
  outstandingAmount: number
  description?: string
}

export interface RevenueCreationAttributes extends BaseCreationAttributes {
  revenueCode: string
  revenueName: string
  revenueType: string
  entityId: string
  fundId: string
  accountId: string
  recognitionBasis: RevenueRecognitionBasis
  fiscalYear: number
  budgetedAmount: number
  actualAmount?: number
  collectedAmount?: number
  outstandingAmount?: number
  description?: string
}

export class Revenue extends BaseModel<RevenueAttributes, RevenueCreationAttributes> {
  public revenueCode!: string
  public revenueName!: string
  public revenueType!: string
  public entityId!: string
  public fundId!: string
  public accountId!: string
  public recognitionBasis!: RevenueRecognitionBasis
  public fiscalYear!: number
  public budgetedAmount!: number
  public actualAmount!: number
  public collectedAmount!: number
  public outstandingAmount!: number
  public description?: string

  // Associations
  public Entity?: Entity
  public Fund?: Fund
  public Account?: ChartOfAccounts

  public static associations: {
    entity: Association<Revenue, Entity>
    fund: Association<Revenue, Fund>
    account: Association<Revenue, ChartOfAccounts>
  }

  // Instance methods
  public getCollectionRate(): number {
    if (this.actualAmount === 0) return 0
    return (this.collectedAmount / this.actualAmount) * 100
  }

  public getBudgetVariance(): number {
    return this.actualAmount - this.budgetedAmount
  }

  public getBudgetVariancePercentage(): number {
    if (this.budgetedAmount === 0) return 0
    return (this.getBudgetVariance() / this.budgetedAmount) * 100
  }
}

Revenue.init(
  {
    ...BaseModel.initBaseModel("revenues"),
    revenueCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    revenueName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    revenueType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [
          [
            "TAX",
            "NON_TAX",
            "INTERGOVERNMENTAL",
            "CHARGES_FOR_SERVICES",
            "FINES_AND_FORFEITURES",
            "INVESTMENT_INCOME",
            "OTHER",
          ],
        ],
      },
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "entities",
        key: "id",
      },
    },
    fundId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "funds",
        key: "id",
      },
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "chart_of_accounts",
        key: "id",
      },
    },
    recognitionBasis: {
      type: DataTypes.ENUM(...Object.values(RevenueRecognitionBasis)),
      allowNull: false,
      defaultValue: RevenueRecognitionBasis.ACCRUAL,
    },
    fiscalYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: 2100,
      },
    },
    budgetedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    actualAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    collectedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    outstandingAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...BaseModel.getBaseOptions("revenues"),
    hooks: {
      beforeSave: (revenue: Revenue) => {
        revenue.outstandingAmount = revenue.actualAmount - revenue.collectedAmount
      },
    },
    indexes: [
      ...BaseModel.getBaseOptions("revenues").indexes,
      {
        unique: true,
        fields: ["revenue_code"],
      },
      {
        fields: ["revenue_type"],
      },
      {
        fields: ["fiscal_year"],
      },
      {
        fields: ["entity_id"],
      },
      {
        fields: ["fund_id"],
      },
      {
        fields: ["account_id"],
      },
      {
        fields: ["recognition_basis"],
      },
    ],
  },
)

// Define associations
Revenue.belongsTo(Entity, {
  as: "entity",
  foreignKey: "entityId",
})

Revenue.belongsTo(Fund, {
  as: "fund",
  foreignKey: "fundId",
})

Revenue.belongsTo(ChartOfAccounts, {
  as: "account",
  foreignKey: "accountId",
})
