module.exports = (sequelize, DataTypes) => {
  const TaskTag = sequelize.define("TaskTag", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    taskId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "task_id"
    },

    tagId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "tag_id"
    }

  }, {
    tableName: "task_tags",
    timestamps: false
  });

  return TaskTag;
};