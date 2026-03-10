module.exports = (sequelize, DataTypes) => {
  const CompanySetting = sequelize.define("CompanySetting", {

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

    workStart: {
      type: DataTypes.TIME,
      field: "work_start"
    },

    workEnd: {
      type: DataTypes.TIME,
      field: "work_end"
    },

    maxBreakMinutes: {
      type: DataTypes.INTEGER,
      field: "max_break_minutes"
    },

    overtimeAllowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "overtime_allowed"
    },

    profileData: {
      type: DataTypes.TEXT("long"),
      field: "profile_data",
      get() {
        const raw = this.getDataValue("profileData");
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
      },
      set(val) {
        this.setDataValue("profileData", val ? JSON.stringify(val) : null);
      }
    }

  }, {
    tableName: "company_settings",
    timestamps: true,
    underscored: true
  });

  return CompanySetting;
};