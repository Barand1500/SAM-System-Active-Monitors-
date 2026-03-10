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
    },

    folderId: {
      type: DataTypes.STRING(100),
      defaultValue: "root",
      field: "folder_id"
    },

    tags: {
      type: DataTypes.TEXT,
      get() {
        const val = this.getDataValue('tags');
        if (!val) return [];
        try { return JSON.parse(val); } catch { return []; }
      },
      set(val) {
        this.setDataValue('tags', val ? JSON.stringify(val) : '[]');
      }
    },

    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }

  }, {
    tableName: "files",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  return File;
};