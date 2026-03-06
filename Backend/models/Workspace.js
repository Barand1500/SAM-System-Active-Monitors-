module.exports = (sequelize, DataTypes) => {
  const Workspace = sequelize.define("Workspace", {
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

    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "created_by"
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    description: DataTypes.TEXT,

    icon: DataTypes.STRING(10)

  }, {
    tableName: "workspaces",
    timestamps: true
  });

  return Workspace;
};