import { DataTypes, type Association } from "sequelize"
import { BaseModel, type BaseAttributes, type BaseCreationAttributes } from "./base.model"
import { AccountType } from "../types/ipsas.types"
import { Entity } from "./entity.model"
import { Fund } from "./fund.model"

export interface ChartOfAccountsAttributes extends BaseAttributes {
  accountCode: string
  accountName: string
  accountType: AccountType
  parentAccountId?: string
  fundId: string
  entityId: string
  isActive: boolean
  description?: string
  normalBalance: "DEBIT" | "CREDIT"
  level: number
  isDetailAccount: boolean
  budgetAccount: boolean
  requiresFundAccounting: boolean
}

export interface ChartOfAccountsCreationAttributes extends BaseCreationAttributes {
  accountCode: string
  accountName: string
  accountType: AccountType
  parentAccountId?: string
  fundId: string
  entityId: string
  isActive?: boolean
  description?: string
  normalBalance?: "DEBIT" | "CREDIT"
  level?: number
  isDetailAccount?: boolean
  budgetAccount?: boolean
  requiresFundAccounting?: boolean
}

export class ChartOfAccounts extends BaseModel<ChartOfAccountsAttributes, ChartOfAccountsCreationAttributes> {
  public accountCode!: string
  public accountName!: string
  public accountType!: AccountType
  public parentAccountId?: string
  public fundId!: string
  public entityId!: string
  public isActive!: boolean
  public description?: string
  public normalBalance!: "DEBIT" | "CREDIT"
  public level!: number
  public isDetailAccount!: boolean
  public budgetAccount!: boolean
  public requiresFundAccounting!: boolean

  // Associations
  public Entity?: Entity
  public Fund?: Fund
  public parent?: ChartOfAccounts
  public children?: ChartOfAccounts[]

  public static associations: {
    entity: Association<ChartOfAccounts, Entity>
    fund: Association<ChartOfAccounts, Fund>
    parent: Association<ChartOfAccounts, ChartOfAccounts>
    children: Association<ChartOfAccounts, ChartOfAccounts>
  }

  // Instance methods
  public getFullAccountCode(): string {
    return `${this.fundId.substring(0, 2)}-${this.accountCode}`
  }

  public isAssetAccount(): boolean {
    return this.accountType === AccountType.ASSET
  }

  public isRevenueAccount(): boolean {
    return this.accountType === AccountType.REVENUE
  }

  public isExpenseAccount(): boolean {
    return this.accountType === AccountType.EXPENSE
  }
}

ChartOfAccounts.init(
  {
    ...BaseModel.initBaseModel("chart_of_accounts"),
    accountCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 20],
        isAlphanumeric: true,
      },
    },
    accountName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    accountType: {
      type: DataTypes.ENUM(...Object.values(AccountType)),
      allowNull: false,
    },
    parentAccountId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "chart_of_accounts",
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
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "entities",
        key: "id",
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
    normalBalance: {
      type: DataTypes.ENUM("DEBIT", "CREDIT"),
      allowNull: false,
      defaultValue: "DEBIT",
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10,
      },
    },
    isDetailAccount: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    budgetAccount: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    requiresFundAccounting: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    ...BaseModel.getBaseOptions("chart_of_accounts"),
    indexes: [
      ...BaseModel.getBaseOptions("chart_of_accounts").indexes,
      {
        unique: true,
        fields: ["account_code", "fund_id", "entity_id"],
      },
      {
        fields: ["account_type"],
      },
      {
        fields: ["parent_account_id"],
      },
      {
        fields: ["fund_id"],
      },
      {
        fields: ["entity_id"],
      },
      {
        fields: ["is_active"],
      },
      {
        fields: ["level"],
      },
      {
        fields: ["is_detail_account"],
      },
    ],
  },
)

// Define associations
ChartOfAccounts.belongsTo(Entity, {
  as: "entity",
  foreignKey: "entityId",
})

ChartOfAccounts.belongsTo(Fund, {
  as: "fund",
  foreignKey: "fundId",
})

ChartOfAccounts.belongsTo(ChartOfAccounts, {
  as: "parent",
  foreignKey: "parentAccountId",
})

ChartOfAccounts.hasMany(ChartOfAccounts, {
  as: "children",
  foreignKey: "parentAccountId",
})
