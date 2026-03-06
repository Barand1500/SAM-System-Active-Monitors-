module.exports = (sequelize, DataTypes) => {
  const UserDashboardSetting = sequelize.define("UserDashboardSetting", {

    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },

    userId: {
      type: DataTypes.BIGINT,
      field: "user_id"
    },

    layout: DataTypes.JSON

  }, {
    tableName: "user_dashboard_settings",
    timestamps: true,
    createdAt: false,
    updatedAt: "updated_at"
  });

  return UserDashboardSetting;
};