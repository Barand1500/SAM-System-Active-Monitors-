module.exports = (sequelize, DataTypes) => {
  const WorkspaceMember = sequelize.define("WorkspaceMember", {

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

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id"
    },

    role: {
      type: DataTypes.ENUM("admin","member"),
      defaultValue: "member"
    },

    joinedAt: {
      type: DataTypes.DATE,
      field: "joined_at"
    }

  }, {
    tableName: "workspace_members",
    timestamps: true,
    underscored: true
  });

  return WorkspaceMember;
};