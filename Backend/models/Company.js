module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define("Company", {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    companyCode: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
      field: "company_code"
    },
    description: DataTypes.TEXT,
    logoUrl: {
      type: DataTypes.STRING(500),
      field: "logo_url"
    },
    industry: DataTypes.STRING(100),
    address: DataTypes.TEXT,
    phone: DataTypes.STRING(20)
  }, {
    tableName: "companies",
    underscored: true,
    timestamps: true
  });

  return Company;
};