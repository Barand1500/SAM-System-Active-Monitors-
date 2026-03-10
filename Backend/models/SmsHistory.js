module.exports = (sequelize, DataTypes) => {
  const SmsHistory = sequelize.define("SmsHistory", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "company_id",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    recipients: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
      get() {
        const val = this.getDataValue("recipients");
        return val ? JSON.parse(val) : [];
      },
      set(val) {
        this.setDataValue("recipients", JSON.stringify(val || []));
      },
    },
    sendTo: {
      type: DataTypes.STRING(20),
      defaultValue: "all",
      field: "send_to",
    },
    templateUsed: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "template_used",
    },
    status: {
      type: DataTypes.ENUM("pending", "sent", "failed"),
      defaultValue: "pending",
    },
    sentBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "sent_by",
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "sent_at",
    },
  }, {
    tableName: "sms_history",
    timestamps: true,
    underscored: true,
  });

  return SmsHistory;
};
