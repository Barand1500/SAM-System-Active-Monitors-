module.exports = (sequelize, DataTypes) => {
  const BreakType = sequelize.define("BreakType", {

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

    maxDuration: {
      type: DataTypes.INTEGER,
      field: "max_duration"
    }

  }, {
    tableName: "break_types",
    timestamps: false
  });

  return BreakType;
};