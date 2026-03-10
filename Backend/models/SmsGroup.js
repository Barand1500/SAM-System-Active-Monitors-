module.exports = (sequelize, DataTypes) => {
  const SmsGroup = sequelize.define("SmsGroup", {
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    emoji: {
      type: DataTypes.STRING(10),
      defaultValue: "👥",
    },
    memberIds: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      field: "member_ids",
      get() {
        const val = this.getDataValue("memberIds");
        return val ? JSON.parse(val) : [];
      },
      set(val) {
        this.setDataValue("memberIds", JSON.stringify(val || []));
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "created_by",
    },
  }, {
    tableName: "sms_groups",
    timestamps: true,
    underscored: true,
  });

  return SmsGroup;
};
