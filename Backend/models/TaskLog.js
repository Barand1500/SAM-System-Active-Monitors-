module.exports = (sequelize, DataTypes) => {
  const TaskLog = sequelize.define("TaskLog", {

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

    startTime: {
      type: DataTypes.DATE,
      field: "start_time"
    },

    endTime: {
      type: DataTypes.DATE,
      field: "end_time"
    },

    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    note: DataTypes.TEXT

  }, {
    tableName: "task_logs",
    timestamps: false
  });

  return TaskLog;
};