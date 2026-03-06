module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    taskListId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "task_list_id"
    },

    companyId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "company_id"
    },

    parentTaskId: {
      type: DataTypes.BIGINT,
      field: "parent_task_id"
    },

    creatorId: {
      type: DataTypes.BIGINT,
      field: "creator_id"
    },

    departmentId: {
      type: DataTypes.BIGINT,
      field: "department_id"
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    description: DataTypes.TEXT,

    type: {
      type: DataTypes.ENUM("task","fault"),
      defaultValue: "task"
    },

    statusId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "status_id"
    },

    priorityId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "priority_id"
    },

    categoryId: {
      type: DataTypes.BIGINT,
      field: "category_id"
    },

    dueDate: {
      type: DataTypes.DATEONLY,
      field: "due_date"
    },

    startDate: {
      type: DataTypes.DATEONLY,
      field: "start_date"
    },

    estimatedHours: {
      type: DataTypes.DECIMAL(5,2),
      defaultValue: 0,
      field: "estimated_hours"
    },

    actualHours: {
      type: DataTypes.DECIMAL(5,2),
      defaultValue: 0,
      field: "actual_hours"
    },

    progressPercent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "progress_percent"
    },

    startedAt: {
      type: DataTypes.DATE,
      field: "started_at"
    },

    completedAt: {
      type: DataTypes.DATE,
      field: "completed_at"
    }

  }, {
    tableName: "tasks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  return Task;
};