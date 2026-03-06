module.exports = (sequelize, DataTypes) => {
  const TaskComment = sequelize.define("TaskComment", {

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

    userId: {
      type: DataTypes.BIGINT,
      field: "user_id"
    },

    parentCommentId: {
      type: DataTypes.BIGINT,
      field: "parent_comment_id"
    },

    commentText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "comment_text"
    }

  }, {
    tableName: "task_comments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  return TaskComment;
};