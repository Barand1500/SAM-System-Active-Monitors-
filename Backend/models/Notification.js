module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {

    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id"
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    message: DataTypes.TEXT,

    type: DataTypes.STRING(50),

    referenceType: {
      type: DataTypes.STRING(20),
      field: "reference_type"
    },

    referenceId: {
      type: DataTypes.BIGINT,
      field: "reference_id"
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_read"
    }

  }, {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return Notification;
};