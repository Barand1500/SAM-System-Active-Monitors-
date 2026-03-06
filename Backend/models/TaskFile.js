module.exports = (sequelize, DataTypes) => {
  const TaskFile = sequelize.define("TaskFile", {

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

    fileId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "file_id"
    }

  }, {
    tableName: "task_files",
    timestamps: false
  });

  return TaskFile;
};