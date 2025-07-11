import { type QueryInterface, DataTypes } from "sequelize"

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable("funds", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fund_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    fund_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fund_type: {
      type: DataTypes.ENUM(
        "GENERAL",
        "SPECIAL_REVENUE",
        "CAPITAL_PROJECTS",
        "DEBT_SERVICE",
        "ENTERPRISE",
        "INTERNAL_SERVICE",
      ),
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    budget_authority: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    carry_forward_allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
  await queryInterface.addIndex("funds", ["fund_code", "entity_id"], {
    unique: true,
    name: "funds_fund_code_entity_id_unique",
  })

  await queryInterface.addIndex("funds", ["fund_type"], {
    name: "funds_fund_type_idx",
  })

  await queryInterface.addIndex("funds", ["entity_id"], {
    name: "funds_entity_id_idx",
  })

  await queryInterface.addIndex("funds", ["is_active"], {
    name: "funds_is_active_idx",
  })

  await queryInterface.addIndex("funds", ["created_at"], {
    name: "funds_created_at_idx",
  })

  await queryInterface.addIndex("funds", ["updated_at"], {
    name: "funds_updated_at_idx",
  })
}

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable("funds")
}
