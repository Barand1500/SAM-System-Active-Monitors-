module.exports = (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define("TaskStatus", {

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
    },

    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_default"
    }

  }, {
    tableName: "task_statuses",
    timestamps: false,
    underscored: true
  });

  return TaskStatus;
};