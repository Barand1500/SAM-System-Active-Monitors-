module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
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

    departmentId: {
      type: DataTypes.BIGINT,
      field: "department_id"
    },

    parentId: {
      type: DataTypes.BIGINT,
      field: "parent_id"
    },

    isReseller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_reseller"
    },

    userType: {
      type: DataTypes.ENUM("individual_tr","individual_foreign","legal_entity"),
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
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "first_name"
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "last_name"
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    avatarUrl: {
      type: DataTypes.STRING(500),
      field: "avatar_url"
    },

    role: {
      type: DataTypes.ENUM("boss","manager","employee","customer"),
      defaultValue: "employee"
    },

    position: DataTypes.STRING(100),
    phone: DataTypes.STRING(20),

    status: {
      type: DataTypes.ENUM("active","inactive","on_leave"),
      defaultValue: "active"
    },

    language: {
      type: DataTypes.ENUM("tr","en"),
      defaultValue: "tr"
    },

    theme: {
      type: DataTypes.ENUM("light","dark"),
      defaultValue: "light"
    },

    lastLogin: {
      type: DataTypes.DATE,
      field: "last_login"
    }

  }, {
    tableName: "users",
    underscored: true,
    timestamps: true
  });

  return User;
};