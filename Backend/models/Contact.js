module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define("Contact", {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    companyId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "company_id",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addresses: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      get() {
        const val = this.getDataValue("addresses");
        try { return val ? JSON.parse(val) : []; } catch { return []; }
      },
      set(val) {
        this.setDataValue("addresses", JSON.stringify(val || []));
      },
    },
  }, {
    tableName: "contacts",
    timestamps: true,
    underscored: true,
  });

  return Contact;
};
