import { type QueryInterface, DataTypes } from "sequelize"

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Create Budgets table
  await queryInterface.createTable("budgets", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    budget_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    budget_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fiscal_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "entities",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    fund_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "funds",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "SUBMITTED", "APPROVED", "ACTIVE", "CLOSED"),
      allowNull: false,
      defaultValue: "DRAFT",
    },
    total_budget_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  })

  // Create Budget Lines table
  await queryInterface.createTable("budget_lines", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    budget_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "budgets",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "chart_of_accounts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    line_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    original_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    revised_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    actual_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    encumbered_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    available_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  })

  // Create Revenues table
  await queryInterface.createTable("revenues", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    revenue_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    revenue_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    revenue_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "entities",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    fund_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "funds",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "chart_of_accounts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    recognition_basis: {
      type: DataTypes.ENUM("CASH", "ACCRUAL", "MODIFIED_ACCRUAL"),
      allowNull: false,
      defaultValue: "ACCRUAL",
    },
    fiscal_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    budgeted_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    actual_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    collected_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    outstanding_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  })

  // Add indexes for Budgets
  await queryInterface.addIndex("budgets", ["budget_code"], {
    unique: true,
    name: "budgets_budget_code_unique",
  })

  await queryInterface.addIndex("budgets", ["fiscal_year"], {
    name: "budgets_fiscal_year_idx",
  })

  await queryInterface.addIndex("budgets", ["entity_id"], {
    name: "budgets_entity_id_idx",
  })

  await queryInterface.addIndex("budgets", ["fund_id"], {
    name: "budgets_fund_id_idx",
  })

  await queryInterface.addIndex("budgets", ["status"], {
    name: "budgets_status_idx",
  })

  await queryInterface.addIndex("budgets", ["created_at"], {
    name: "budgets_created_at_idx",
  })

  await queryInterface.addIndex("budgets", ["updated_at"], {
    name: "budgets_updated_at_idx",
  })

  // Add indexes for Budget Lines
  await queryInterface.addIndex("budget_lines", ["budget_id"], {
    name: "budget_lines_budget_id_idx",
  })

  await queryInterface.addIndex("budget_lines", ["account_id"], {
    name: "budget_lines_account_id_idx",
  })

  await queryInterface.addIndex("budget_lines", ["line_number"], {
    name: "budget_lines_line_number_idx",
  })

  await queryInterface.addIndex("budget_lines", ["created_at"], {
    name: "budget_lines_created_at_idx",
  })

  await queryInterface.addIndex("budget_lines", ["updated_at"], {
    name: "budget_lines_updated_at_idx",
  })

  // Add indexes for Revenues
  await queryInterface.addIndex("revenues", ["revenue_code"], {
    unique: true,
    name: "revenues_revenue_code_unique",
  })

  await queryInterface.addIndex("revenues", ["revenue_type"], {
    name: "revenues_revenue_type_idx",
  })

  await queryInterface.addIndex("revenues", ["fiscal_year"], {
    name: "revenues_fiscal_year_idx",
  })

  await queryInterface.addIndex("revenues", ["entity_id"], {
    name: "revenues_entity_id_idx",
  })

  await queryInterface.addIndex("revenues", ["fund_id"], {
    name: "revenues_fund_id_idx",
  })

  await queryInterface.addIndex("revenues", ["account_id"], {
    name: "revenues_account_id_idx",
  })

  await queryInterface.addIndex("revenues", ["recognition_basis"], {
    name: "revenues_recognition_basis_idx",
  })

  await queryInterface.addIndex("revenues", ["created_at"], {
    name: "revenues_created_at_idx",
  })

  await queryInterface.addIndex("revenues", ["updated_at"], {
    name: "revenues_updated_at_idx",
  })
}

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable("revenues")
  await queryInterface.dropTable("budget_lines")
  await queryInterface.dropTable("budgets")
}
