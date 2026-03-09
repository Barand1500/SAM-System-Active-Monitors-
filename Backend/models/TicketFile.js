module.exports = (sequelize, DataTypes) => {
  const TicketFile = sequelize.define("TicketFile", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    ticketId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "ticket_id"
    },

    messageId: {
      type: DataTypes.BIGINT,
      field: "message_id"
    },

    fileUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "file_url"
    },

    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_name"
    },

    fileSize: {
      type: DataTypes.BIGINT,
      field: "file_size"
    },

    uploadedBy: {
      type: DataTypes.BIGINT,
      field: "uploaded_by"
    }

  }, {
    tableName: "ticket_files",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return TicketFile;
};
