module.exports = (sequelize, DataTypes) => {
  const TaskPriority = sequelize.define("TaskPriority", {

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

    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

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
    tableName: "task_priorities",
    timestamps: false
  });   

  return TaskPriority;
};