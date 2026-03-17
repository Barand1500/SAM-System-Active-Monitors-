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
      field: "company_code"
    },
    description: DataTypes.TEXT,
    logoUrl: {
      type: DataTypes.STRING(500),
      field: "logo_url"
    },
    industry: DataTypes.STRING(100),
    companyType: {
      type: DataTypes.ENUM('gercek', 'tuzel'),
      defaultValue: 'gercek',
      field: 'company_type'
    },
    tcNo: {
      type: DataTypes.STRING(11),
      field: 'tc_no'
    },
    vergiNo: {
      type: DataTypes.STRING(10),
      field: 'vergi_no'
    },
    vergiDairesi: {
      type: DataTypes.STRING(100),
      field: 'vergi_dairesi'
    },
    address: DataTypes.TEXT,
    phone: DataTypes.STRING(20)
  }, {
    tableName: "companies",
    underscored: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ['company_code'], name: 'company_code' },
      { unique: true, fields: ['tc_no'], name: 'unique_tc_no', where: { tc_no: { [require('sequelize').Op.ne]: null } } },
      { unique: true, fields: ['vergi_no'], name: 'unique_vergi_no', where: { vergi_no: { [require('sequelize').Op.ne]: null } } }
    ]
  });

  return Company;
};