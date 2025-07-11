import { type QueryInterface, DataTypes } from "sequelize"

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Create GL Transactions table
  await queryInterface.createTable("gl_transactions", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transaction_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    transaction_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    posting_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    source_module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    source_document_id: {
      type: DataTypes.UUID,
      allowNull: true,
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
    fiscal_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("DRAFT", "PENDING", "APPROVED", "POSTED", "REVERSED"),
      allowNull: false,
      defaultValue: "DRAFT",
    },
    total_debit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_credit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    posted_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    posted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reversed_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reversed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reversal_reason: {
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

  // Create GL Entries table
  await queryInterface.createTable("gl_entries", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transaction_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "gl_transactions",
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
    debit_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    credit_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    line_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cost_center: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    project_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    department_code: {
      type: DataTypes.STRING(20),
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

  // Add indexes for GL Transactions
  await queryInterface.addIndex("gl_transactions", ["transaction_number"], {
    unique: true,
    name: "gl_transactions_transaction_number_unique",
  })

  await queryInterface.addIndex("gl_transactions", ["transaction_date"], {
    name: "gl_transactions_transaction_date_idx",
  })

  await queryInterface.addIndex("gl_transactions", ["posting_date"], {
    name: "gl_transactions_posting_date_idx",
  })

  await queryInterface.addIndex("gl_transactions", ["status"], {
    name: "gl_transactions_status_idx",
  })

  await queryInterface.addIndex("gl_transactions", ["source_module"], {
    name: "gl_transactions_source_module_idx",
  })

  await queryInterface.addIndex("gl_transactions", ["fund_id"], {
    name: "gl_transactions_fund_id_idx",
  })

  await queryInterface.addIndex("gl_transactions", ["entity_id"], {
    name: "gl_transactions_entity_id_idx",
  })

  await queryInterface.addIndex("gl_transactions", ["fiscal_year", "period"], {
    name: "gl_transactions_fiscal_year_period_idx",
  })

  await queryInterface.addIndex("gl_transactions", ["created_by"], {
    name: "gl_transactions_created_by_idx",
  })

  await queryInterface.addIndex("gl_transactions", ["created_at"], {
    name: "gl_transactions_created_at_idx",
  })

  await queryInterface.addIndex("gl_transactions", ["updated_at"], {
    name: "gl_transactions_updated_at_idx",
  })

  // Add indexes for GL Entries
  await queryInterface.addIndex("gl_entries", ["transaction_id"], {
    name: "gl_entries_transaction_id_idx",
  })

  await queryInterface.addIndex("gl_entries", ["account_id"], {
    name: "gl_entries_account_id_idx",
  })

  await queryInterface.addIndex("gl_entries", ["line_number"], {
    name: "gl_entries_line_number_idx",
  })

  await queryInterface.addIndex("gl_entries", ["cost_center"], {
    name: "gl_entries_cost_center_idx",
  })

  await queryInterface.addIndex("gl_entries", ["project_code"], {
    name: "gl_entries_project_code_idx",
  })

  await queryInterface.addIndex("gl_entries", ["created_at"], {
    name: "gl_entries_created_at_idx",
  })

  await queryInterface.addIndex("gl_entries", ["updated_at"], {
    name: "gl_entries_updated_at_idx",
  })
}

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable("gl_entries")
  await queryInterface.dropTable("gl_transactions")
}
