module.exports = (sequelize, DataTypes) => {
  const TaskAssignment = sequelize.define("TaskAssignment", {

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
      allowNull: false,
      field: "user_id"
    },

    assignedBy: {
      type: DataTypes.BIGINT,
      field: "assigned_by"
    },

    role: {
      type: DataTypes.ENUM("lead","support"),
      defaultValue: "support"
    },

    assignedAt: {
      type: DataTypes.DATE,
      field: "assigned_at"
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active"
    },

    endedAt: {
      type: DataTypes.DATE,
      field: "ended_at"
    }

  }, {
    tableName: "task_assignments",
    timestamps: false
  });

  return TaskAssignment;
};