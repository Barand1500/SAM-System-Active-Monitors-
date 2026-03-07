module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define("Department", {
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
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: DataTypes.TEXT,
    color: {
      type: DataTypes.STRING(7),
      defaultValue: "#6366f1"
    }
  }, {
    tableName: "departments",
    underscored: true,
    timestamps: true,
  });

  return Department;
};