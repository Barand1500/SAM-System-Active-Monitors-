module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define("Tag", {

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

    color: {
      type: DataTypes.STRING(7),
      defaultValue: "#6366f1"
    }

  }, {
    tableName: "tags",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return Tag;
}; 