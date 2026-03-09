module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define("Survey", {

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
      field: "created_by"
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    description: DataTypes.TEXT,

    status: {
      type: DataTypes.ENUM("draft", "active", "closed", "archived"),
      defaultValue: "draft"
    },

    startDate: {
      type: DataTypes.DATE,
      field: "start_date"
    },

    endDate: {
      type: DataTypes.DATE,
      field: "end_date"
    },

    targetRole: {
      type: DataTypes.STRING(50),
      field: "target_role"
    },

    allowMultipleResponses: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "allow_multiple_responses"
    },

    anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }

  }, {
    tableName: "surveys",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  return Survey;
};
