import { DataTypes, type Association } from "sequelize"
import { BaseModel, type BaseAttributes, type BaseCreationAttributes } from "./base.model"
import { BudgetStatus } from "../types/ipsas.types"
import { Entity } from "./entity.model"
import { Fund } from "./fund.model"
import { ChartOfAccounts } from "./chartOfAccounts.model"

export interface BudgetAttributes extends BaseAttributes {
  budgetCode: string
  budgetName: string
  fiscalYear: number
  startDate: Date
  endDate: Date
  entityId: string
  fundId: string
  status: BudgetStatus
  totalBudgetAmount: number
  approvedBy?: string
  approvedAt?: Date
  description?: string
}

export interface BudgetCreationAttributes extends BaseCreationAttributes {
  budgetCode: string
  budgetName: string
  fiscalYear: number
  startDate: Date
  endDate: Date
  entityId: string
  fundId: string
  status?: BudgetStatus
  totalBudgetAmount: number
  approvedBy?: string
  approvedAt?: Date
  description?: string
}

export class Budget extends BaseModel<BudgetAttributes, BudgetCreationAttributes> {
  public budgetCode!: string
  public budgetName!: string
  public fiscalYear!: number
  public startDate!: Date
  public endDate!: Date
  public entityId!: string
  public fundId!: string
  public status!: BudgetStatus
  public totalBudgetAmount!: number
  public approvedBy?: string
  public approvedAt?: Date
  public description?: string

  // Associations
  public Entity?: Entity
  public Fund?: Fund
  public budgetLines?: BudgetLine[]

  public static associations: {
    entity: Association<Budget, Entity>
    fund: Association<Budget, Fund>
    budgetLines: Association<Budget, BudgetLine>
  }
}

Budget.init(
  {
    ...BaseModel.initBaseModel("budgets"),
    budgetCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    budgetName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255],
      },
    },
    fiscalYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: 2100,
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
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
    fundId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "funds",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BudgetStatus)),
      allowNull: false,
      defaultValue: BudgetStatus.DRAFT,
    },
    totalBudgetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...BaseModel.getBaseOptions("budgets"),
    indexes: [
      ...BaseModel.getBaseOptions("budgets").indexes,
      {
        unique: true,
        fields: ["budget_code"],
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
        fields: ["status"],
      },
    ],
  },
)

// Budget Line Item Model
export interface BudgetLineAttributes extends BaseAttributes {
  budgetId: string
  accountId: string
  lineNumber: number
  description: string
  originalAmount: number
  revisedAmount: number
  actualAmount: number
  encumberedAmount: number
  availableAmount: number
}

export interface BudgetLineCreationAttributes extends BaseCreationAttributes {
  budgetId: string
  accountId: string
  lineNumber: number
  description: string
  originalAmount: number
  revisedAmount?: number
  actualAmount?: number
  encumberedAmount?: number
  availableAmount?: number
}

export class BudgetLine extends BaseModel<BudgetLineAttributes, BudgetLineCreationAttributes> {
  public budgetId!: string
  public accountId!: string
  public lineNumber!: number
  public description!: string
  public originalAmount!: number
  public revisedAmount!: number
  public actualAmount!: number
  public encumberedAmount!: number
  public availableAmount!: number

  // Associations
  public budget?: Budget
  public account?: ChartOfAccounts

  public static associations: {
    budget: Association<BudgetLine, Budget>
    account: Association<BudgetLine, ChartOfAccounts>
  }

  // Instance methods
  public calculateAvailableAmount(): number {
    return this.revisedAmount - this.actualAmount - this.encumberedAmount
  }

  public getVariance(): number {
    return this.actualAmount - this.revisedAmount
  }

  public getVariancePercentage(): number {
    if (this.revisedAmount === 0) return 0
    return (this.getVariance() / this.revisedAmount) * 100
  }
}

BudgetLine.init(
  {
    ...BaseModel.initBaseModel("budget_lines"),
    budgetId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "budgets",
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
    lineNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    originalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    revisedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    actualAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    encumberedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    availableAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    ...BaseModel.getBaseOptions("budget_lines"),
    hooks: {
      beforeSave: (budgetLine: BudgetLine) => {
        budgetLine.availableAmount = budgetLine.calculateAvailableAmount()
      },
    },
    indexes: [
      ...BaseModel.getBaseOptions("budget_lines").indexes,
      {
        fields: ["budget_id"],
      },
      {
        fields: ["account_id"],
      },
      {
        fields: ["line_number"],
      },
    ],
  },
)

// Define associations
Budget.belongsTo(Entity, {
  as: "entity",
  foreignKey: "entityId",
})

Budget.belongsTo(Fund, {
  as: "fund",
  foreignKey: "fundId",
})

Budget.hasMany(BudgetLine, {
  as: "budgetLines",
  foreignKey: "budgetId",
})

BudgetLine.belongsTo(Budget, {
  as: "budget",
  foreignKey: "budgetId",
})

BudgetLine.belongsTo(ChartOfAccounts, {
  as: "account",
  foreignKey: "accountId",
})
