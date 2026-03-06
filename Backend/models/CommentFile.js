module.exports = (sequelize, DataTypes) => {
  const CommentFile = sequelize.define("CommentFile", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    commentId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "comment_id"
    },

    fileId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "file_id"
    }

  }, {
    tableName: "comment_files",
    timestamps: false
  });

  return CommentFile;
};