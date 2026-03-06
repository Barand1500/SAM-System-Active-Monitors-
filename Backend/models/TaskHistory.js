module.exports = (sequelize, DataTypes) => {
  const TaskHistory = sequelize.define("TaskHistory", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    taskId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "task_id"
    },

    userId: {
      type: DataTypes.BIGINT,
      field: "user_id"
    },

    action: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    oldValue: {
      type: DataTypes.TEXT,
      field: "old_value"
    },

    newValue: {
      type: DataTypes.TEXT,
      field: "new_value"
    }

  }, {
    tableName: "task_history",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return TaskHistory;
};