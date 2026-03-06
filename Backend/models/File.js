module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define("File", {

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

    uploadedBy: {
      type: DataTypes.BIGINT,
      field: "uploaded_by"
    },

    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_name"
    },

    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "file_url"
    },

    fileType: {
      type: DataTypes.STRING(50),
      field: "file_type"
    },

    fileSize: {
      type: DataTypes.BIGINT,
      field: "file_size"
    }

  }, {
    tableName: "files",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return File;
};