module.exports = (sequelize, DataTypes) => {
  const AutomationRule = sequelize.define("AutomationRule", {

    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },

    companyId: {
      type: DataTypes.BIGINT,
      field: "company_id"
    },

    name: DataTypes.STRING(255),

    triggerEvent: {
      type: DataTypes.STRING(255),
      field: "trigger_event"
    },

    condition: {
      type: DataTypes.TEXT,
      field: "condition_"
    },

    action: {
      type: DataTypes.TEXT,
      field: "action_"
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active"
    }

  }, {
    tableName: "automation_rules",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return AutomationRule;
};