import { DataTypes, type Association } from "sequelize"
import { BaseModel, type BaseAttributes, type BaseCreationAttributes } from "./base.model"
import { TransactionStatus } from "../types/ipsas.types"
import { Entity } from "./entity.model"
import { Fund } from "./fund.model"

export interface GLTransactionAttributes extends BaseAttributes {
  transactionNumber: string
  transactionDate: Date
  postingDate: Date
  description: string
  referenceNumber?: string
  sourceModule: string
  sourceDocumentId?: string
  fundId: string
  entityId: string
  fiscalYear: number
  period: number
  status: TransactionStatus
  totalDebit: number
  totalCredit: number
  createdBy: string
  approvedBy?: string
  postedBy?: string
  postedAt?: Date
  reversedBy?: string
  reversedAt?: Date
  reversalReason?: string
}

export interface GLTransactionCreationAttributes extends BaseCreationAttributes {
  transactionNumber?: string
  transactionDate: Date
  postingDate: Date
  description: string
  referenceNumber?: string
  sourceModule: string
  sourceDocumentId?: string
  fundId: string
  entityId: string
  fiscalYear: number
  period: number
  status?: TransactionStatus
  createdBy: string
  totalDebit?: number
  totalCredit?: number
}

export class GLTransaction extends BaseModel<GLTransactionAttributes, GLTransactionCreationAttributes> {
  public transactionNumber!: string
  public transactionDate!: Date
  public postingDate!: Date
  public description!: string
  public referenceNumber?: string
  public sourceModule!: string
  public sourceDocumentId?: string
  public fundId!: string
  public entityId!: string
  public fiscalYear!: number
  public period!: number
  public status!: TransactionStatus
  public totalDebit!: number
  public totalCredit!: number
  public createdBy!: string
  public approvedBy?: string
  public postedBy?: string
  public postedAt?: Date
  public reversedBy?: string
  public reversedAt?: Date
  public reversalReason?: string

  // Associations
  public Entity?: Entity
  public Fund?: Fund
  public entries?: GLEntry[]

  public static associations: {
    entity: Association<GLTransaction, Entity>
    fund: Association<GLTransaction, Fund>
    entries: Association<GLTransaction, GLEntry>
  }

  // Instance methods
  public isBalanced(): boolean {
    return Math.abs(this.totalDebit - this.totalCredit) < 0.01
  }

  public canBePosted(): boolean {
    return this.status === TransactionStatus.APPROVED && this.isBalanced()
  }

  public generateTransactionNumber(): string {
    const year = this.fiscalYear.toString().slice(-2)
    const period = this.period.toString().padStart(2, "0")
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `GL${year}${period}${random}`
  }
}

GLTransaction.init(
  {
    ...BaseModel.initBaseModel("gl_transactions"),
    transactionNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    transactionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true,
      },
    },
    postingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 1000],
      },
    },
    referenceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sourceModule: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [["REVENUE", "BUDGET", "EXPENDITURE", "ASSET", "LIABILITY", "MANUAL", "SYSTEM"]],
      },
    },
    sourceDocumentId: {
      type: DataTypes.UUID,
      allowNull: true,
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
    fiscalYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: 2100,
      },
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransactionStatus)),
      allowNull: false,
      defaultValue: TransactionStatus.DRAFT,
    },
    totalDebit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    totalCredit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    postedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    postedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reversedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reversedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reversalReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...BaseModel.getBaseOptions("gl_transactions"),
    hooks: {
      beforeCreate: (transaction: GLTransaction) => {
        if (!transaction.transactionNumber) {
          transaction.transactionNumber = transaction.generateTransactionNumber()
        }
      },
    },
    indexes: [
      ...BaseModel.getBaseOptions("gl_transactions").indexes,
      {
        unique: true,
        fields: ["transaction_number"],
      },
      {
        fields: ["transaction_date"],
      },
      {
        fields: ["posting_date"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["source_module"],
      },
      {
        fields: ["fund_id"],
      },
      {
        fields: ["entity_id"],
      },
      {
        fields: ["fiscal_year", "period"],
      },
      {
        fields: ["created_by"],
      },
    ],
  },
)

// Define associations
GLTransaction.belongsTo(Entity, {
  as: "entity",
  foreignKey: "entityId",
})

GLTransaction.belongsTo(Fund, {
  as: "fund",
  foreignKey: "fundId",
})

// GL Entry Model
import { ChartOfAccounts } from "./chartOfAccounts.model"

export interface GLEntryAttributes extends BaseAttributes {
  transactionId: string
  accountId: string
  debitAmount: number
  creditAmount: number
  description?: string
  lineNumber: number
  costCenter?: string
  projectCode?: string
  departmentCode?: string
}

export interface GLEntryCreationAttributes extends BaseCreationAttributes {
  transactionId: string
  accountId: string
  debitAmount?: number
  creditAmount?: number
  description?: string
  lineNumber: number
  costCenter?: string
  projectCode?: string
  departmentCode?: string
}

export class GLEntry extends BaseModel<GLEntryAttributes, GLEntryCreationAttributes> {
  public transactionId!: string
  public accountId!: string
  public debitAmount!: number
  public creditAmount!: number
  public description?: string
  public lineNumber!: number
  public costCenter?: string
  public projectCode?: string
  public departmentCode?: string

  // Associations
  public transaction?: GLTransaction
  public account?: ChartOfAccounts

  public static associations: {
    transaction: Association<GLEntry, GLTransaction>
    account: Association<GLEntry, ChartOfAccounts>
  }

  // Instance methods
  public getAmount(): number {
    return this.debitAmount || this.creditAmount || 0
  }

  public isDebit(): boolean {
    return this.debitAmount > 0
  }

  public isCredit(): boolean {
    return this.creditAmount > 0
  }
}

GLEntry.init(
  {
    ...BaseModel.initBaseModel("gl_entries"),
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "gl_transactions",
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
    debitAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    creditAmount: {
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
    lineNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    costCenter: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    projectCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    departmentCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    ...BaseModel.getBaseOptions("gl_entries"),
    validate: {
      eitherDebitOrCredit() {
        if ((this.debitAmount > 0 && this.creditAmount > 0) || (this.debitAmount === 0 && this.creditAmount === 0)) {
          throw new Error("Entry must have either debit or credit amount, but not both")
        }
      },
    },
    indexes: [
      ...BaseModel.getBaseOptions("gl_entries").indexes,
      {
        fields: ["transaction_id"],
      },
      {
        fields: ["account_id"],
      },
      {
        fields: ["line_number"],
      },
      {
        fields: ["cost_center"],
      },
      {
        fields: ["project_code"],
      },
    ],
  },
)

// Define associations
GLEntry.belongsTo(GLTransaction, {
  as: "transaction",
  foreignKey: "transactionId",
})

GLEntry.belongsTo(ChartOfAccounts, {
  as: "account",
  foreignKey: "accountId",
})

GLTransaction.hasMany(GLEntry, {
  as: "entries",
  foreignKey: "transactionId",
})
