module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define("Role", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "company_id",
    },
    roleKey: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "role_key",
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(20),
      defaultValue: "#6366f1",
    },
    permissions: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      get() {
        const val = this.getDataValue("permissions");
        return val ? JSON.parse(val) : [];
      },
      set(val) {
        this.setDataValue("permissions", JSON.stringify(val || []));
      },
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "sort_order",
    },
  }, {
    tableName: "roles",
    timestamps: true,
    underscored: true,
  });

  return Role;
};
