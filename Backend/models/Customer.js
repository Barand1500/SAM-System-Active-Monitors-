module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define("Customer", {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      field: "user_id"
    },

    isReseller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_reseller"
    },

    userType: {
      type: DataTypes.ENUM("individual_tr", "individual_foreign", "legal_entity"),
      defaultValue: "individual_tr",
      field: "user_type"
    },

    identityNumber: {
      type: DataTypes.STRING(20),
      field: "identity_number"
    },

    taxNumber: {
      type: DataTypes.STRING(20),
      field: "tax_number"
    },

    taxOffice: {
      type: DataTypes.STRING(100),
      field: "tax_office"
    },

    companyName: {
      type: DataTypes.STRING(255),
      field: "company_name"
    }

  }, {
    tableName: "customers",
    underscored: true,
    timestamps: true
  });

  return Customer;
};
