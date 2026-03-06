module.exports = (sequelize, DataTypes) => {
  const ProjectMember = sequelize.define("ProjectMember", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    projectId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "project_id"
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id"
    },

    role: {
      type: DataTypes.ENUM("lead","member"),
      defaultValue: "member"
    },

    joinedAt: {
      type: DataTypes.DATE,
      field: "joined_at"
    }

  }, {
    tableName: "project_members",
    timestamps: false
  });

  return ProjectMember;
};