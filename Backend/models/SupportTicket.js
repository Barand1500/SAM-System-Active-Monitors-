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

  }, {
    tableName: "support_tickets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  return SupportTicket;
};
