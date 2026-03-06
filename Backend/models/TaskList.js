module.exports = (sequelize, DataTypes) => {
  const TaskList = sequelize.define("TaskList", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    projectId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "project_id"
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    description: DataTypes.TEXT,

    color: {
      type: DataTypes.STRING(7),
      defaultValue: "#6366f1"
    },

    orderNo: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "order_no"
    }

  }, {
    tableName: "task_lists",
    timestamps: false
  });

  return TaskList;
};