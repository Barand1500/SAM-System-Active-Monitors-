module.exports = (sequelize, DataTypes) => {
  const SupportTicket = sequelize.define("SupportTicket", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    companyId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "company_id"
    },

    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "created_by"
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    description: DataTypes.TEXT,

    status: {
      type: DataTypes.ENUM(
        "open",
        "in_progress",
        "waiting_customer",
        "resolved",
        "closed"
      ),
      defaultValue: "open"
    },

    priority: {
      type: DataTypes.ENUM("critical", "high", "medium", "low"),
      defaultValue: "medium"
    },

    category: {
      type: DataTypes.STRING(100)
    },

    assignedTo: {
      type: DataTypes.BIGINT,
      field: "assigned_to"
    },

    callerName: {
      type: DataTypes.STRING(200),
      field: "caller_name"
    },

    callerPhone: {
      type: DataTypes.STRING(30),
      field: "caller_phone"
    },

    callerCompany: {
      type: DataTypes.STRING(200),
      field: "caller_company"
    },

    callerAddress: {
      type: DataTypes.TEXT,
      field: "caller_address",
      get() {
        const val = this.getDataValue('callerAddress');
        if (!val) return null;
        try { return JSON.parse(val); } catch { return val; }
      },
      set(val) {
        this.setDataValue('callerAddress', val ? JSON.stringify(val) : null);
      }
    },

    resolution: {
      type: DataTypes.TEXT
    },

    relatedTaskId: {
      type: DataTypes.BIGINT,
      field: "related_task_id"
    },

    resolvedAt: {
      type: DataTypes.DATE,
      field: "resolved_at"
    },

    closedAt: {
      type: DataTypes.DATE,
      field: "closed_at"
    },

    reopenCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "reopen_count"
    },

  }, {
    tableName: "support_tickets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  return SupportTicket;
};
