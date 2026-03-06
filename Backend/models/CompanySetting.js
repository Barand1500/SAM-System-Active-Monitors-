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
    }

  }, {
    tableName: "company_settings",
    timestamps: false
  });

  return CompanySetting;
};