module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define("Announcement", {

    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },

    companyId: {
      type: DataTypes.BIGINT,
      field: "company_id"
    },

    userId: {
      type: DataTypes.BIGINT,
      field: "user_id"
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    priority: {
      type: DataTypes.ENUM("normal","important","urgent"),
      defaultValue: "normal"
    },

    targetRole: {
      type: DataTypes.STRING(50),
      field: "target_role"
    },

    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_pinned"
    },

    expiryDate: {
      type: DataTypes.DATEONLY,
      field: "expiry_date"
    }

  }, {
    tableName: "announcements",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return Announcement;
};