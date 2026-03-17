const bcrypt = require("bcrypt");

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
      allowNull: false
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

    roles: {
      type: DataTypes.TEXT,
      get() {
        const val = this.getDataValue('roles');
        if (!val) return null;
        try { return JSON.parse(val); } catch { return null; }
      },
      set(val) {
        this.setDataValue('roles', val ? JSON.stringify(val) : null);
      }
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
    timestamps: true,
    indexes: [
      { unique: true, fields: ['email'], name: 'email' }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password && !user.password.startsWith("$2b$")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && !user.password.startsWith("$2b$")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  return User;
};