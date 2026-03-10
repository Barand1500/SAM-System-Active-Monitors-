module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define("Customer", {
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

    type: {
      type: DataTypes.ENUM("gercek", "tuzel", "yabanci"),
      defaultValue: "gercek"
    },

    companyName: {
      type: DataTypes.STRING(255),
      field: "company_name"
    },

    contactName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: "contact_name"
    },

    email: {
      type: DataTypes.STRING(255)
    },

    phones: {
      type: DataTypes.TEXT,
      get() {
        const val = this.getDataValue('phones');
        if (!val) return [];
        try { return JSON.parse(val); } catch { return []; }
      },
      set(val) {
        this.setDataValue('phones', val ? JSON.stringify(val) : '[]');
      }
    },

    addresses: {
      type: DataTypes.TEXT,
      get() {
        const val = this.getDataValue('addresses');
        if (!val) return [];
        try { return JSON.parse(val); } catch { return []; }
      },
      set(val) {
        this.setDataValue('addresses', val ? JSON.stringify(val) : '[]');
      }
    },

    sector: {
      type: DataTypes.STRING(100)
    },

    notes: {
      type: DataTypes.TEXT
    },

    tags: {
      type: DataTypes.TEXT,
      get() {
        const val = this.getDataValue('tags');
        if (!val) return [];
        try { return JSON.parse(val); } catch { return []; }
      },
      set(val) {
        this.setDataValue('tags', val ? JSON.stringify(val) : '[]');
      }
    },

    tcNo: {
      type: DataTypes.STRING(11),
      field: "tc_no"
    },

    vergiDairesi: {
      type: DataTypes.STRING(100),
      field: "vergi_dairesi"
    },

    vergiNo: {
      type: DataTypes.STRING(10),
      field: "vergi_no"
    },

    passportNo: {
      type: DataTypes.STRING(20),
      field: "passport_no"
    },

    parentId: {
      type: DataTypes.BIGINT,
      field: "parent_id"
    },

    createdBy: {
      type: DataTypes.BIGINT,
      field: "created_by"
    }

  }, {
    tableName: "customers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  return Customer;
};
