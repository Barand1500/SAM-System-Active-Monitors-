module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("Project", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    workspaceId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "workspace_id"
    },

    createdBy: {
      type: DataTypes.BIGINT,
      field: "created_by"
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    description: DataTypes.TEXT,

    status: {
      type: DataTypes.ENUM("active","inactive","completed","archived"),
      defaultValue: "active"
    },

    color: {
      type: DataTypes.STRING(7),
      defaultValue: "#6366f1"
    },

    icon: DataTypes.STRING(10),

    startDate: {
      type: DataTypes.DATEONLY,
      field: "start_date"
    },

    endDate: {
      type: DataTypes.DATEONLY,
      field: "end_date"
    }

  }, {
    tableName: "projects",
    timestamps: true
  });

  return Project;
};