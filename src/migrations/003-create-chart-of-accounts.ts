import { type QueryInterface, DataTypes } from "sequelize"

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable("chart_of_accounts", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    account_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    account_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    account_type: {
      type: DataTypes.ENUM("ASSET", "LIABILITY", "NET_POSITION", "REVENUE", "EXPENSE"),
      allowNull: false,
    },
    parent_account_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "chart_of_accounts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    normal_balance: {
      type: DataTypes.ENUM("DEBIT", "CREDIT"),
      allowNull: false,
      defaultValue: "DEBIT",
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_detail_account: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    budget_account: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    requires_fund_accounting: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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

  // Add indexes
  await queryInterface.addIndex("chart_of_accounts", ["account_code", "fund_id", "entity_id"], {
    unique: true,
    name: "chart_of_accounts_account_code_fund_entity_unique",
  })

  await queryInterface.addIndex("chart_of_accounts", ["account_type"], {
    name: "chart_of_accounts_account_type_idx",
  })

  await queryInterface.addIndex("chart_of_accounts", ["parent_account_id"], {
    name: "chart_of_accounts_parent_account_id_idx",
  })

  await queryInterface.addIndex("chart_of_accounts", ["fund_id"], {
    name: "chart_of_accounts_fund_id_idx",
  })

  await queryInterface.addIndex("chart_of_accounts", ["entity_id"], {
    name: "chart_of_accounts_entity_id_idx",
  })

  await queryInterface.addIndex("chart_of_accounts", ["is_active"], {
    name: "chart_of_accounts_is_active_idx",
  })

  await queryInterface.addIndex("chart_of_accounts", ["level"], {
    name: "chart_of_accounts_level_idx",
  })

  await queryInterface.addIndex("chart_of_accounts", ["is_detail_account"], {
    name: "chart_of_accounts_is_detail_account_idx",
  })

  await queryInterface.addIndex("chart_of_accounts", ["created_at"], {
    name: "chart_of_accounts_created_at_idx",
  })

  await queryInterface.addIndex("chart_of_accounts", ["updated_at"], {
    name: "chart_of_accounts_updated_at_idx",
  })
}

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable("chart_of_accounts")
}
