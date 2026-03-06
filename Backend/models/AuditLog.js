module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define("AuditLog", {

    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },

    userId: {
      type: DataTypes.BIGINT,
      field: "user_id"
    },

    action: DataTypes.STRING(255),

    tableName: {
      type: DataTypes.STRING(255),
      field: "table_name"
    },

    recordId: {
      type: DataTypes.BIGINT,
      field: "record_id"
    },

    oldValue: {
      type: DataTypes.TEXT,
      field: "old_value"
    },

    newValue: {
      type: DataTypes.TEXT,
      field: "new_value"
    },

    ipAddress: {
      type: DataTypes.STRING(45),
      field: "ip_address"
    }

  }, {
    tableName: "audit_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return AuditLog;
};