module.exports = (sequelize, DataTypes) => {
  const RecurringTask = sequelize.define("RecurringTask", {

    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },

    companyId: { type: DataTypes.BIGINT, field: "company_id" },

    createdBy: { type: DataTypes.BIGINT, field: "created_by" },

    title: DataTypes.STRING(255),

    description: DataTypes.TEXT,

    frequency: {
      type: DataTypes.ENUM("daily","weekly","biweekly","monthly")
    },

    dayOfWeek: {
      type: DataTypes.INTEGER,
      field: "day_of_week"
    },

    dayOfMonth: {
      type: DataTypes.INTEGER,
      field: "day_of_month"
    },

    timeOfDay: {
      type: DataTypes.TIME,
      field: "time_of_day"
    },

    priorityId: {
      type: DataTypes.BIGINT,
      field: "priority_id"
    },

    assigneeId: {
      type: DataTypes.BIGINT,
      field: "assignee_id"
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active"
    },

    lastRunAt: {
      type: DataTypes.DATE,
      field: "last_run_at"
    },

    nextRunAt: {
      type: DataTypes.DATE,
      field: "next_run_at"
    }

  }, {
    tableName: "recurring_tasks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return RecurringTask;
};